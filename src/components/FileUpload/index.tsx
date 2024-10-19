import {
  FileInputWrapper,
  StyledButton,
  StyledFileInput,
  ButtonTitle,
  FileTitle,
} from "./styles";

export const FileUpload: React.FC<{
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
