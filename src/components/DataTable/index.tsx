import { VacationPay } from "../../interfaces";
import { Table, TableHeader, TableCell } from "./styles";

export const DataTable: React.FC<{ data: VacationPay[] }> = ({ data }) => (
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
