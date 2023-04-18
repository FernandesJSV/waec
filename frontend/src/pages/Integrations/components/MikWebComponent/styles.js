import styled from 'styled-components';

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  padding: 20px;
  margin-bottom: auto;
  flex: 1;
`;

export const TextContainer = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: 20px;
  margin-bottom: 20px;

  > span {
    font-size: 16px;
    font-weight: 500;
  }
`;
