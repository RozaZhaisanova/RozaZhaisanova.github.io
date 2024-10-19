import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import styled from "styled-components";

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

const AppContainer = styled.div`
  padding: 20px;
  max-width: 800px;
  margin: auto;
  text-align: center;
`;

const Title = styled.h1`
  color: #333;
`;

const FileInputWrapper = styled.div`
  position: relative;
  display: inline-block;
`;
const StyledFileInput = styled.input`
  display: none;
`;
export const ButtonTitle = styled.span`
  font-family: Montserrat;
  font-size: 17px;
  font-weight: 600;
  line-height: 20.72px;
  text-align: center;
`;
const StyledButton = styled.button`
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  background-color: #2f4f4f;
  color: white;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s;

  &:hover {
    opacity: 0.7;
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 5px rgba(0, 123, 255, 0.5);
  }
`;
const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const TableHeader = styled.th`
  background-color: #f2f2f2;
  padding: 10px;
`;

const TableCell = styled.td`
  border: 1px solid #ddd;
  padding: 8px;
`;
export const FileTitle = styled.h2`
  font-family: Montserrat;
  font-size: 20px;
  font-weight: 600;
  line-height: 24.38px;
  text-align: left;
  color: #838383;
  padding-bottom: 8px;
  padding-top: 8px;

  @media (max-width: 1200px) {
    text-align: center;
  }
`;
const FileUpload: React.FC<{
  onFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  fileName?: string | null;
}> = ({ onFileChange, fileName }) => (
  <FileInputWrapper>
    <StyledFileInput
      type="file"
      accept=".xlsx"
      onChange={onFileChange}
      id="file-upload"
    />
    <StyledButton as="label" htmlFor="file-upload">
      <ButtonTitle>Выберите файл</ButtonTitle>
    </StyledButton>
    {fileName && <FileTitle>Вы загружали файл: {fileName}</FileTitle>}
  </FileInputWrapper>
);

const DataTable: React.FC<{ data: VacationPay[] }> = ({ data }) => (
  <Table>
    <thead>
      <tr>
        <TableHeader>ФИО</TableHeader>
        <TableHeader>Общий заработок за год</TableHeader>
        <TableHeader>Размер отпускных</TableHeader>
      </tr>
    </thead>
    <tbody>
      {data.map((item) => (
        <tr key={`${item.name}-${item.totalEarnings}`}>
          <TableCell>{item.name}</TableCell>
          <TableCell>{item.totalEarnings}</TableCell>
          <TableCell>{item.vacationPay}</TableCell>
        </tr>
      ))}
    </tbody>
  </Table>
);

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
      <Title>Расчет отпускных</Title>
      <FileUpload onFileChange={handleFileChange} fileName={fileName} />
      {data.length > 0 && <DataTable data={data} />}
    </AppContainer>
  );
};

export default App;
