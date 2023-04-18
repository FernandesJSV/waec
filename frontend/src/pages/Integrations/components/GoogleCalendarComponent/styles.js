import styled from 'styled-components';

export const SwitchContainer = styled.div`
  display: flex;
  flex-direction: ${({ custom }) => (custom ? 'row' : 'column')};
  justify-content: ${({ custom }) => (custom ? 'space-between' : 'flex-start')};
  gap: 10px;
  width: 100%;
  margin-left: 10px;
  margin-top: 10px;
`;

export const LabelContainer = styled.div`
  width: 100%;
`;

export const ButtonsContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  margin-top: auto;
  padding: 10px;
`;

export const Divider = styled.div`
  width: 100%;
  margin-bottom: 10px;
  margin-top: 10px;
  border-bottom: 1px solid #eee;
`;

export const StyledMainHeader = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 6px 6px 6px 6px;
  color: white;

  span {
    height: 25px;
    font-weight: 500;
  }
`;

export const GoogleContainer = styled.div`
  display: flex;
  flex-direction: row;
  gap: 10px;
  margin-right: 10px;

  &&& {
    span > {
      font-weight: 400;
    }
  }
`;
