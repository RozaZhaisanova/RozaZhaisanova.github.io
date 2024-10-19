import styled from "styled-components";

export const FileInputWrapper = styled.div`
  position: relative;
  display: inline-block;
`;
export const StyledFileInput = styled.input`
  display: none;
`;
export const StyledButton = styled.button`
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
`;
export const ButtonTitle = styled.span`
  font-family: Montserrat;
  font-size: 17px;
  font-weight: 600;
  line-height: 20.72px;
  text-align: center;
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
`;
