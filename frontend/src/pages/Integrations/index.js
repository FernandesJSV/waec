/* eslint-disable no-console */
import React from 'react';

import { Grid } from '@material-ui/core';

// import hinovaImg from '../../assets/hinova.png';
// import siprovImg from '../../assets/siprov.png';
import mikwebImg from '../../assets/mikweb.png';
import asaasImg from '../../assets/asaas.png';
// import blingImg from '../../assets/bling.png';

import MainHeader from '../../components/MainHeader';
import Title from '../../components/Title';
import MainContainer from '../Reports/components/MainContainer';
import IntegrationLinkBox from './components/IntegrationLinkBox';

const Integrations = () => {
  return (
    <MainContainer>
      <MainHeader>
        <Title>Integrações</Title>
      </MainHeader>
      <Grid container spacing={4} sx={{ overflowY: 'unset' }}>

        {/* HINOVA */}
        {/* <Grid item xs={3}>
          <IntegrationLinkBox
            title="HINOVA"
            link="/integrations/hinova"
            customStyle={{ marginTop: '55px' }}
            img={hinovaImg}
          />
        </Grid> */}

        {/* SIPROV */}
        {/* <Grid item xs={3}>
          <IntegrationLinkBox
            title="SIPROV"
            link="/integrations/siprov"
            customStyle={{ marginTop: '55px' }}
            img={siprovImg}
          />
        </Grid> */}

        {/* MIKWEB */}
        <Grid item xs={3}>
          <IntegrationLinkBox
            title="MIKWEB"
            link="/integrations/mikweb"
            customStyle={{ marginTop: '55px' }}
            img={mikwebImg}
          />
        </Grid>

        {/* ASAAS */}
        <Grid item xs={3}>
          <IntegrationLinkBox
            title="ASAAS"
            link="/integrations/asaas"
            customStyle={{ marginTop: '55px' }}
            img={asaasImg}
          />
        </Grid>

        {/* BLING */}
        {/* <Grid item xs={3}>
          <IntegrationLinkBox
            title="BLING"
            link="/integrations/bling"
            customStyle={{ marginTop: '55px' }}
            img={blingImg}
          />
        </Grid> */}


      </Grid>
    </MainContainer>
  );
};

export default Integrations;
