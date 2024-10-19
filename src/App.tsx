import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";

interface SalaryData {
  ФИО?: string;
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
  const [data, setData] = useState<VacationPay[]>(() => {
    const savedData = localStorage.getItem("vacationPayData");
    return savedData ? JSON.parse(savedData) : [];
  });
  const [fileName, setFileName] = useState<string | null>(null);
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const arrayBuffer = e.target?.result as ArrayBuffer;
      const workbook = XLSX.read(arrayBuffer, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData: SalaryData[] = XLSX.utils.sheet_to_json(worksheet);

      if (!jsonData.length || !jsonData[0].Год || !jsonData[0].ЗП) {
        console.error("Неверная структура данных");
        return;
      }
      localStorage.setItem("fileName", file.name);
      processSalaryData(jsonData);
    };
    reader.readAsArrayBuffer(file);
  };

  const processSalaryData = (data: SalaryData[]) => {
    const aggregatedData: { [key: string]: { totalEarnings: number } } = {};
    let lastName = "";

    data.forEach(({ ФИО, Год, ЗП }) => {
      if (!Год || isNaN(ЗП)) return;

      if (ФИО) {
        lastName = ФИО;
      }

      const key = `${lastName}-${Год}`;
      if (!aggregatedData[key]) {
        aggregatedData[key] = { totalEarnings: 0 };
      }
      aggregatedData[key].totalEarnings += ЗП;
    });

    const vacationPayData: VacationPay[] = Object.entries(aggregatedData).map(
      ([key, { totalEarnings }]) => {
        const name = key.split("-")[0];
        return {
          name,
          totalEarnings,
          vacationPay: totalEarnings * 0.1,
        };
      }
    );

    setData(vacationPayData);

    localStorage.setItem("vacationPayData", JSON.stringify(vacationPayData));
  };

  useEffect(() => {
    const data = localStorage.getItem("vacationPayData");
    if (data) {
      const vacationPayData = JSON.parse(data);
      setData(vacationPayData);
    }
    const filesName = localStorage.getItem("fileName");
    if (filesName) {
      const name = filesName;
      setFileName(name);
    }
  }, []);

  return (
    <div>
      <h1>Расчет отпускных</h1>
      <input type="file" accept=".xlsx" onChange={handleFileChange} />
      {fileName && <p>Вы загружали файл: {fileName}</p>}
      {data.length > 0 && (
        <table>
          <thead>
            <tr>
              <th>ФИО</th>
              <th>Общий заработок за год</th>
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
