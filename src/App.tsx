import React, { useState } from "react";
import * as XLSX from "xlsx";

interface SalaryData {
  ФИО: string;
  Год: number;
  Месяц: number;
  ЗП: number;
}

interface VacationPay {
  name: string;
  totalEarnings: number;
  vacationPay: number;
}

const App: React.FC = () => {
  const [data, setData] = useState<VacationPay[]>([]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const arrayBuffer = e.target?.result as ArrayBuffer;
      const workbook = XLSX.read(arrayBuffer, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData: SalaryData[] = XLSX.utils.sheet_to_json(worksheet);

      // Проверка структуры данных
      if (!jsonData.length || !jsonData[0].ФИО || !jsonData[0].ЗП) {
        console.error("Неверная структура данных");
        return;
      }

      processSalaryData(jsonData);
    };
    reader.readAsArrayBuffer(file);
  };

  const processSalaryData = (data: SalaryData[]) => {
    const aggregatedData: {
      [key: string]: { totalEarnings: number; count: number };
    } = {};

    data.forEach(({ ФИО, ЗП }) => {
      if (!ФИО || isNaN(ЗП)) return;
      if (!aggregatedData[ФИО]) {
        aggregatedData[ФИО] = { totalEarnings: 0, count: 0 };
      }
      aggregatedData[ФИО].totalEarnings += ЗП;
      aggregatedData[ФИО].count += 1;
    });

    const vacationPayData: VacationPay[] = Object.entries(aggregatedData).map(
      ([name, { totalEarnings }]) => ({
        name,
        totalEarnings,
        vacationPay: totalEarnings * 0.1, // Предположим, что отпускные составляют 10% от общего заработка
      })
    );

    setData(vacationPayData);
  };

  return (
    <div>
      <h1>Расчет отпускных</h1>
      <input type="file" accept=".xlsx" onChange={handleFileChange} />
      {data.length > 0 && (
        <table>
          <thead>
            <tr>
              <th>ФИО</th>
              <th>Общий заработок</th>
              <th>Размер отпускных</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <tr key={index}>
                <td>{item.name}</td>
                <td>{item.totalEarnings}</td>
                <td>{item.vacationPay}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default App;
