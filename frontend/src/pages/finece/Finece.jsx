import React, { useState } from "react";
import { ChevronLeft, ChevronRight, Plus, Trash2, X } from "lucide-react";
import "./Finece.css";

const INITIAL_TRANSACTIONS = {
  "2026-08-15": [
    { id: 1, type: "income", title: "เงินเดือนเข้า", amount: 25000 },
    { id: 2, type: "expense", title: "ค่าชาบู", amount: 499 }
  ],
  "2026-08-16": [
    { id: 3, type: "expense", title: "ค่าน้ำมัน", amount: 800 }
  ]
};

const MONTH_NAMES = [
  "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
  "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"
];

function Finece() {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 7, 1));
  const [transactions, setTransactions] = useState(INITIAL_TRANSACTIONS);
  const [selectedDateStr, setSelectedDateStr] = useState(null);
  const [formData, setFormData] = useState({ title: "", type: "expense", amount: "" });

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const handlePrevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const calendarCells = [];
  for (let i = 0; i < firstDayOfWeek; i++) {
    calendarCells.push(null);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    const formattedDay = String(day).padStart(2, '0');
    const formattedMonth = String(month + 1).padStart(2, '0');
    const dateStr = `${year}-${formattedMonth}-${formattedDay}`;
    calendarCells.push({ day, dateStr });
  }

  const getCumulativeBalanceOnDate = (targetDateStr) => {
    const [targetYear, targetMonth] = targetDateStr.split('-');

    const sortedDates = Object.keys(transactions).sort();

    let runningBalance = 0;
    let hasTransaction = false;

    for (const dateStr of sortedDates) {
      const [itemYear, itemMonth] = dateStr.split('-');

      if (itemYear !== targetYear || itemMonth !== targetMonth) continue;
      
      if (dateStr > targetDateStr) break;

      const dayItems = transactions[dateStr] || [];
      if (dayItems.length > 0) hasTransaction = true;

      dayItems.forEach(item => {
        if (item.type === 'income') runningBalance += item.amount;
        if (item.type === 'expense') runningBalance -= item.amount;
      });
    }

    return { balance: runningBalance, hasData: hasTransaction };
  };

  const handleOpenModal = (dateStr) => {
    setSelectedDateStr(dateStr);
    setFormData({ title: "", type: "expense", amount: "" });
  };

  const handleCloseModal = () => setSelectedDateStr(null);

  const handleAddItem = (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.amount) return;

    const newItem = {
      id: Date.now(),
      title: formData.title.trim(),
      type: formData.type,
      amount: Number(formData.amount)
    };

    const dayItems = transactions[selectedDateStr] || [];
    setTransactions({
      ...transactions,
      [selectedDateStr]: [...dayItems, newItem]
    });

    setFormData({ title: "", type: "expense", amount: "" });
  };

  const handleDeleteItem = (id) => {
    const dayItems = transactions[selectedDateStr] || [];
    const updatedItems = dayItems.filter(item => item.id !== id);

    setTransactions({
      ...transactions,
      [selectedDateStr]: updatedItems
    });
  };

  return (
    <div className="calendar-container py-4">
      {/* Header สลับเดือน */}
      <div className="calendar-month-header">
        <button className="btn btn-outline-secondary btn-sm" onClick={handlePrevMonth}>
          <ChevronLeft size={20} />
        </button>
        <h3 className="calendar-month-title">
          {MONTH_NAMES[month]} {year + 543}
        </h3>
        <button className="btn btn-outline-secondary btn-sm" onClick={handleNextMonth}>
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Grid ปฏิทิน */}
      <div className="calendar-grid">
        {["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"].map((d, i) => (
          <div key={d} className={`calendar-header-day ${i === 0 ? "text-danger" : ""}`}>
            {d}
          </div>
        ))}

        {calendarCells.map((cell, idx) => {
          if (!cell) return <div key={`empty-${idx}`} className="calendar-cell empty"></div>;

          const { balance, hasData } = getCumulativeBalanceOnDate(cell.dateStr);

          return (
            <div
              key={cell.dateStr}
              className="calendar-cell"
              onClick={() => handleOpenModal(cell.dateStr)}
            >
              <div className="day-number">{cell.day}</div>
              <div className="day-summary">
                {hasData && (
                  <div className={`fw-bold ${balance >= 0 ? "text-primary" : "text-danger"}`}>
                    ฿{balance.toLocaleString()}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Pop-up (Modal) */}
      {selectedDateStr && (
        <div className="modal-backdrop">
          <div className="modal-content-custom">
            <div className="d-flex justify-content-between align-items-center border-bottom pb-2 mb-3">
              <h5 className="m-0 fw-bold">บันทึกรายการ: {selectedDateStr}</h5>
              <button className="btn-close-custom" onClick={handleCloseModal}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddItem} className="row g-2 mb-3">
              <div className="col-4">
                <select
                  className="form-select form-select-sm"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                >
                  <option value="expense">รายจ่าย</option>
                  <option value="income">รายรับ</option>
                </select>
              </div>
              <div className="col-5">
                <input
                  type="text"
                  className="form-control form-control-sm"
                  placeholder="ชื่อรายการ"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>
              <div className="col-3">
                <input
                  type="number"
                  className="form-control form-control-sm"
                  placeholder="จำนวนเงิน"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                />
              </div>
              <div className="col-12 text-end">
                <button type="submit" className="btn btn-primary btn-sm w-100">
                  <Plus size={16} className="me-1" /> เพิ่มรายการ
                </button>
              </div>
            </form>

            <div className="transaction-list">
              {(transactions[selectedDateStr] || []).length === 0 ? (
                <div className="text-center text-muted py-3">ยังไม่มีรายการในวันนี้</div>
              ) : (
                (transactions[selectedDateStr] || []).map((item) => (
                  <div key={item.id} className="d-flex justify-content-between align-items-center border-bottom py-2">
                    <div>
                      <span className="fw-medium">{item.title}</span>
                    </div>
                    <div className="d-flex align-items-center gap-2">
                      <span className={item.type === "income" ? "text-success fw-bold" : "text-danger fw-bold"}>
                        {item.type === "income" ? "+" : "-"}{item.amount.toLocaleString()}
                      </span>
                      <button className="btn-icon text-danger" onClick={() => handleDeleteItem(item.id)}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Finece;