import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Plus, Trash2 } from "lucide-react";

// Import PrimeReact Components
import { Dialog } from "primereact/dialog";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Tag } from "primereact/tag";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";

import { getTransactions, createTransaction, deleteTransaction } from "../../services/Api";
import "./Finece.css";

const MONTH_NAMES = [
  "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
  "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"
];

function Finece() {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 7, 1));
  const [transactions, setTransactions] = useState({});
  const [selectedDateStr, setSelectedDateStr] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ title: "", type: "expense", amount: "" });

  const pullTransactionData = async () => {
    try {
      const data = await getTransactions();
      const formatted = {};
      if (Array.isArray(data)) {
        data.forEach((item) => {
          if (!formatted[item.date]) {
            formatted[item.date] = [];
          }
          formatted[item.date].push(item);
        });
      }
      setTransactions(formatted);
    } catch (error) {
      console.error("Error fetching transactions:", error);
    }
  };

  useEffect(() => {
    pullTransactionData();
  }, []);

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
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedDateStr(null);
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.amount) return;

    const payload = {
      date: selectedDateStr,
      title: formData.title.trim(),
      type: formData.type,
      amount: Number(formData.amount)
    };

    try {
      await createTransaction(payload);
      await pullTransactionData();
      setFormData({ title: "", type: "expense", amount: "" });
    } catch (error) {
      console.error("Error adding item:", error);
    }
  };

  const executeDelete = async (id) => {
    try {
      await deleteTransaction(id);
      await pullTransactionData();
    } catch (error) {
      console.error("Error deleting item:", error);
    }
  };

  const handleDeleteItem = (id) => {
    confirmDialog({
      message: 'คุณต้องการลบรายการนี้ใช่หรือไม่?',
      header: 'ยืนยันการลบข้อมูล',
      icon: 'pi pi-exclamation-triangle',
      defaultFocus: 'reject',
      acceptClassName: 'p-button-danger',
      acceptLabel: 'ลบ',
      rejectLabel: 'ยกเลิก',
      accept: () => executeDelete(id), // ทำงานเมื่อกด "ลบ"
    });
  };

  // --- Templates สำหรับแสดงผลใน DataTable ---
  const typeBodyTemplate = (rowData) => {
    return rowData.type === 'income' 
      ? <Tag severity="success" value="รายรับ"></Tag>
      : <Tag severity="danger" value="รายจ่าย"></Tag>;
  };

const amountBodyTemplate = (rowData) => {
  const isIncome = rowData.type === 'income';

  return (
    <span className={isIncome ? "text-success fw-bold" : "text-danger fw-bold"}>
      {/* ใช้ออปชัน ?. เพื่อว่าถ้า amount จาก API เป็น null/undefined จะไม่พัง และ fallback ด้วย 0 */}
      {isIncome ? "+" : "-"}{(rowData.amount?.toLocaleString() ?? 0)} ฿
    </span>
  );
};

  const actionBodyTemplate = (rowData) => {
    return (
      <button 
        className="btn btn-link text-danger p-0 border-0" 
        onClick={() => handleDeleteItem(rowData.id)}
      >
        <Trash2 size={16} />
      </button>
    );
  };

  return (
    <div className="calendar-container py-4">
      <ConfirmDialog />
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

      {/* PrimeReact Dialog (Modal) */}
<Dialog
        header={`บันทึกและสรุปรายการ: ${selectedDateStr}`}
        visible={isModalOpen}
        style={{ width: '50vw' }}
        breakpoints={{ '960px': '75vw', '641px': '90vw' }}
        onHide={handleCloseModal}
      >
        {/* ตาราง PrimeReact DataTable แสดงรายการ */}
        <DataTable 
          value={transactions[selectedDateStr] || []} 
          emptyMessage="ยังไม่มีรายการในวันนี้"
          responsiveLayout="scroll"
          stripedRows
          size="small"
        >
          <Column field="type" header="ประเภท" body={typeBodyTemplate} style={{ width: '15%' }} />
          <Column field="title" header="รายการ" style={{ width: '45%' }} />
          <Column field="amount" header="จำนวนเงิน" body={amountBodyTemplate} style={{ width: '25%' }} />
          <Column body={actionBodyTemplate} style={{ width: '15%', textAlign: 'center' }} />
        </DataTable>

        {/* ฟอร์มเพิ่มรายการ - ใช้ Inline Style บังคับแนวนอนเป๊ะๆ */}
        <form 
          onSubmit={handleAddItem} 
          style={{ 
            display: 'flex', 
            flexDirection: 'row', 
            alignItems: 'center', 
            gap: '8px', 
            marginTop: '16px' 
          }}
        >
          <div style={{ width: '110px', flexShrink: 0 }}>
            <select
              style={{ width: '100%', padding: '6px 8px', borderRadius: '4px', border: '1px solid #ccc' }}
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            >
              <option value="expense">รายจ่าย</option>
              <option value="income">รายรับ</option>
            </select>
          </div>

          <div style={{ flex: 1 }}>
            <input
              type="text"
              style={{ width: '100%', padding: '6px 8px', borderRadius: '4px', border: '1px solid #ccc' }}
              placeholder="ชื่อรายการ"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div style={{ width: '110px', flexShrink: 0 }}>
            <input
              type="number"
              style={{ width: '100%', padding: '6px 8px', borderRadius: '4px', border: '1px solid #ccc' }}
              placeholder="จำนวนเงิน"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            />
          </div>

          <div style={{ flexShrink: 0 }}>
            <button 
              type="submit" 
              style={{ 
                display: 'inline-flex', 
                alignItems: 'center', 
                padding: '6px 16px', 
                backgroundColor: '#0d6efd', 
                color: '#fff', 
                border: 'none', 
                borderRadius: '4px', 
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              <Plus size={16} style={{ marginRight: '4px' }} /> เพิ่ม
            </button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}

export default Finece;