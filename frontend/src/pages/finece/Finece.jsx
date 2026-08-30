import React, {useState} from "react";
import './Finece.css';

// 1. ครอบ Props ทั้งหมดด้วย Object { ... }
// 2. ตั้งค่า default ให้ months เป็น MONTHS ถ้าไม่ได้ส่งมา
const DEFAULT_MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEPT', 'OCT', 'NOV', 'DEC'];

const INITIAL_INCOME = [
  { id: 1, name: 'Paycheck 1', monthly: [5987, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
  { id: 2, name: 'Paycheck 2', monthly: [200, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
  { id: 3, name: 'Side Income', monthly: [100, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] }
];

function Finece() {

    const [items, setItems] = useState(INITIAL_INCOME);
  const [newItemName, setNewItemName] = useState('');

  // 1. Helper Function: คำนวณยอดรวมรายหมวดหมู่
  const getRowTotal = (monthlyArray) => 
    monthlyArray.reduce((acc, curr) => acc + (Number(curr) || 0), 0);

  // Helper Function: ฟอร์แมตตัวเลข
  const formatNum = (val) => 
    val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  // 2. CREATE: เพิ่มหมวดหมู่ใหม่
  const handleAddItem = (e) => {
    e.preventDefault();
    if (!newItemName.trim()) return;

    const newItem = {
      id: Date.now(),
      name: newItemName.trim(),
      monthly: Array(12).fill(0)
    };

    setItems([...items, newItem]);
    setNewItemName('');
  };

  // 3. UPDATE: แก้ไขชื่อหมวดหมู่
  const handleNameChange = (id, newName) => {
    setItems(items.map(item => item.id === id ? { ...item, name: newName } : item));
  };

  // UPDATE: แก้ไขจำนวนเงินในแต่ละเดือน
  const handleAmountChange = (id, monthIdx, value) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const updatedMonthly = [...item.monthly];
        updatedMonthly[monthIdx] = Number(value) || 0;
        return { ...item, monthly: updatedMonthly };
      }
      return item;
    }));
  };

  // 4. DELETE: ลบหมวดหมู่
  const handleDeleteItem = (id) => {
    setItems(items.filter(item => item.id !== id));
  };

  return (
<div className="container py-4">
      {/* Form สำหรับ CREATE หมวดหมู่ใหม่ */}
      <form onSubmit={handleAddItem} className="row g-2 mb-3">
        <div className="col-auto">
          <input
            type="text"
            className="form-control form-control-sm"
            placeholder="เพิ่มหมวดหมู่ใหม่..."
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
          />
        </div>
        <div className="col-auto">
          <button type="submit" className="btn btn-primary btn-sm">
            + เพิ่มหมวดหมู่
          </button>
        </div>
      </form>

      {/* READ & UPDATE Table */}
      <div className="card border-0 shadow-sm">
        <div className="card-header fw-bold text-white income-header d-flex justify-content-between align-items-center">
          <span>Income Matrix</span>
          <span className="badge bg-light text-dark">จำนวน {items.length} รายการ</span>
        </div>
        <div className="card-body p-0 table-responsive">
          <table className="table table-bordered table-sm mb-0 align-middle">
            <thead className="table-light">
              <tr>
                <th className="text-start ps-3 col-category">Category</th>
                {DEFAULT_MONTHS.map((m) => (
                  <th key={m} className="text-center">{m}</th>
                ))}
                <th className="text-end pe-3">Annually</th>
                <th className="text-center col-action">Action</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  {/* UPDATE Name */}
                  <td className="ps-2">
                    <input
                      type="text"
                      className="form-control form-control-sm border-0 bg-transparent fw-medium"
                      value={item.name}
                      onChange={(e) => handleNameChange(item.id, e.target.value)}
                    />
                  </td>

                  {/* UPDATE Monthly Values */}
                  {item.monthly.map((val, monthIdx) => (
                    <td key={monthIdx} className="text-center">
                      <div className="d-flex align-items-center justify-content-center">
                        <span className="me-1 text-muted">$</span>
                        <input
                          type="number"
                          className="form-control form-control-sm text-end input-amount"
                          value={val || ''}
                          onChange={(e) => handleAmountChange(item.id, monthIdx, e.target.value)}
                        />
                      </div>
                    </td>
                  ))}

                  {/* READ Annually Total */}
                  <td className="text-end fw-bold pe-3">
                    ${formatNum(getRowTotal(item.monthly))}
                  </td>

                  {/* DELETE Button */}
                  <td className="text-center">
                    <button
                      type="button"
                      className="btn btn-outline-danger btn-sm py-0 px-2"
                      onClick={() => handleDeleteItem(item.id)}
                      title="ลบรายการ"
                    >
                      &times;
                    </button>
                  </td>
                </tr>
              ))}

              {items.length === 0 && (
                <tr>
                  <td colSpan={15} className="text-center py-3 text-muted">
                    ยังไม่มีข้อมูล กรุณาเพิ่มหมวดหมู่ใหม่
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Finece;


