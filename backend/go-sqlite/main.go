package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"path"
	"strconv"

	_ "github.com/glebarez/go-sqlite"
)

type Transaction struct {
	ID      int     `json:"id"`
	TxnDate string  `json:"date"`
	Title   string  `json:"title"`
	Type    string  `json:"type"`
	Amount  float64 `json:"amount"`
}

var db *sql.DB

func main() {
	// Connect to the SQLite database
	var err error
	db, err = sql.Open("sqlite", "./finance.db")
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	_, _ = db.Exec("PRAGMA foreign_keys = ON;")

	initDB()

	http.HandleFunc("/api/transactions", handleTransactions)
	http.HandleFunc("/api/transactions/", handleTransactions)

	fmt.Println("Server running on http://localhost:8080")
	log.Fatal(http.ListenAndServe(":8080", nil))
}

func initDB() {
	query := `
	CREATE TABLE IF NOT EXISTS transactions (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		txn_date TEXT NOT NULL,
		title TEXT NOT NULL,
		type TEXT CHECK(type IN ('income', 'expense')) NOT NULL,
		amount REAL NOT NULL
	);`
	_, err := db.Exec(query)
	if err != nil {
		log.Fatalf("Failed to create table: %v", err)
	}
}

// Handler รองรับทั้ง GET (ดึงข้อมูล) และ POST (เพิ่มข้อมูล)
func handleTransactions(w http.ResponseWriter, r *http.Request) {
	// CORS Headers
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
	w.Header().Set("Content-Type", "application/json")

	if r.Method == "OPTIONS" {
		w.WriteHeader(http.StatusOK)
		return
	}

	// ✅ ใช้ path.Base ดึง segmentสุดท้ายของ URL เช่น /api/transactions/4 -> "4"
	basePath := path.Base(r.URL.Path)
	id, errID := strconv.Atoi(basePath) // ถ้าแปลงเป็นตัวเลขได้ แสดงว่ามีการส่ง ID มาจริง

	switch r.Method {
	case "GET":
		rows, err := db.Query("SELECT id, txn_date, title, type, amount FROM transactions ORDER BY txn_date ASC")
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		defer rows.Close()

		list := make([]Transaction, 0)
		for rows.Next() {
			var t Transaction
			if err := rows.Scan(&t.ID, &t.TxnDate, &t.Title, &t.Type, &t.Amount); err != nil {
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}
			list = append(list, t)
		}
		json.NewEncoder(w).Encode(list)

	case "POST":
		var t Transaction
		if err := json.NewDecoder(r.Body).Decode(&t); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}

		result, err := db.Exec("INSERT INTO transactions (txn_date, title, type, amount) VALUES (?, ?, ?, ?)",
			t.TxnDate, t.Title, t.Type, t.Amount)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		lastID, _ := result.LastInsertId()
		t.ID = int(lastID)
		w.WriteHeader(http.StatusCreated)
		json.NewEncoder(w).Encode(t)

	case "PUT": // 👈 เพิ่ม Case การแก้ไขข้อมูล
		if errID != nil || id <= 0 {
			http.Error(w, "Invalid transaction ID", http.StatusBadRequest)
			return
		}

		var t Transaction
		if err := json.NewDecoder(r.Body).Decode(&t); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}

		_, err := db.Exec("UPDATE transactions SET txn_date = ?, title = ?, type = ?, amount = ? WHERE id = ?",
			t.TxnDate, t.Title, t.Type, t.Amount, id)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(map[string]string{"message": "Updated successfully"})

	case "DELETE":
		// ✅ เช็กว่า id แปลงเป็นตัวเลขสำเร็จหรือไม่
		if errID != nil || id <= 0 {
			http.Error(w, "Missing or invalid transaction ID", http.StatusBadRequest)
			return
		}

		_, err := db.Exec("DELETE FROM transactions WHERE id = ?", id)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(map[string]string{"message": "Deleted successfully"})

	default:
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
	}
}
