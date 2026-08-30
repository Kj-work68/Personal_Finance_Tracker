package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"net/http"

	_ "github.com/glebarez/go-sqlite"
)

type Transaction struct {
	ID      int     `json:"id"`
	TxnDate string  `json:"date"`
	Title   string  `json:"title"`
	Type    string  `json:"type"`
	Amount  float64 `json:"amount`
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
	// ตั้งค่า CORS ให้ React (Port 5173/3000) เรียกใช้งานได้
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
	w.Header().Set("Content-Type", "application/json")

	if r.Method == "OPTIONS" {
		return
	}

	switch r.Method {
	case "GET":
		// ดึงรายการทั้งหมดเรียงตามวันที่
		rows, err := db.Query("SELECT id, txn_date, title, type, amount FROM transactions ORDER BY txn_date ASC")
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		defer rows.Close()

		var list []Transaction
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
		// รับข้อมูล JSON จาก React เพื่อบันทึกเข้า DB
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

		id, _ := result.LastInsertId()
		t.ID = int(id)
		w.WriteHeader(http.StatusCreated)
		json.NewEncoder(w).Encode(t)

	default:
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
	}
}
