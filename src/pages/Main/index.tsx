import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import { SalaryData, VacationPay } from "../../interfaces";
import { DataTable } from "../../components/DataTable";
import { FileUpload } from "../../components/FileUpload";
import { AppContainer, ErrMsgTitle } from "./styles";

export const Main: React.FC = () => {
  const [data, setData] = useState<VacationPay[]>(() => {
    const savedData = localStorage.getItem("vacationPayData");
    return savedData ? JSON.parse(savedData) : [];
  });
  const [fileName, setFileName] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMessage("");

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
        setErrorMessage("Неверная структура данных");
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
      if (!Год || ЗП === undefined || isNaN(ЗП)) return;

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
          vacationPay: parseFloat(
            ((totalEarnings / 12 / 29.3) * 28).toFixed(4)
          ),
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
      if (Array.isArray(vacationPayData)) {
        setData(vacationPayData);
      }
    }
    const filesName = localStorage.getItem("fileName");
    if (filesName) {
      setFileName(filesName);
    }
  }, []);

  return (
    <AppContainer>
      {errorMessage ? (
        <>
          <h1>Расчет отпускных</h1>
          <ErrMsgTitle>{errorMessage}</ErrMsgTitle>
          <FileUpload onFileChange={handleFileChange} fileName={fileName} />
        </>
      ) : (
        <>
          <h1>Расчет отпускных</h1>
          <FileUpload onFileChange={handleFileChange} fileName={fileName} />
          {data.length > 0 && <DataTable data={data} />}
        </>
      )}
    </AppContainer>
  );
};
