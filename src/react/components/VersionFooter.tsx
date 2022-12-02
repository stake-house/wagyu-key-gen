import { Grid, Typography } from "@material-ui/core";
import React from "react";
import styled from "styled-components";

declare var VERSION: string;
declare var COMMITHASH: string;
declare var CLIVERSION: string;
declare var CLICOMMITHASH: string;

const SoftText = styled(Typography)`
  color: #b5b4b5;
  text-align: center;
  font-size: 11px;
`;

const Container = styled.div`
  position: fixed;
  bottom: 35;
  width: 100%;
`;

/**
 * This component is a footer used to display the version and commit hash.
 * 
 * @returns the footer component containing the version and commit hash
 */
const VersionFooter = () => {
  return(
    <Container style={{zIndex: -99}}>
      <Grid container>
        <Grid item xs={2} />
        <Grid item xs={8}>
          <SoftText>
            GUI: {VERSION}#{COMMITHASH}
            <br/>
            Deposit-CLI: {CLIVERSION}#{CLICOMMITHASH}
            <br/>
            <br/>
            THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
          </SoftText>
        </Grid>
        <Grid item xs={2} />
      </Grid>
    </Container>
  )
}

export default VersionFooter;