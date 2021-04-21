import { Black, Button, ButtonHover } from "../colors";

import { Link } from "react-router-dom";
import React from "react";
import styled from "styled-components";

type FooterProps = {
  backLink: string;
  backLabel: string;
  nextLink: string;
  nextLabel: string;
}

const FooterContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  align-self: flex-end;
  height: 70;
  flex-grow:1;
  min-width:100vw;
`;

const StyledButton = styled(Link)`
  color: ${Black};
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  align-self:flex-end;
  height: 24;
  background-color: ${Button};
  padding: 16 24;
  border-radius: 10%;
  text-decoration: none;

  transition: 250ms background-color ease;
  cursor: pointer;
  margin: 60;

  &:hover {
    background-color: ${ButtonHover};
  }
`;


const Footer = (props: FooterProps) => {
  return(
    <FooterContainer>
      { props.backLink ? <StyledButton to={props.backLink}>{props.backLabel}</StyledButton> : <div></div> }
      { props.nextLink ? <StyledButton to={props.nextLink}>{props.nextLabel}</StyledButton> : <div></div> }
    </FooterContainer>
  )

}

export default Footer;