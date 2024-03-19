// /Users/vivien/Documents/MargaRH/src/pages/OrganizationalPage.jsx

import { Container, Heading} from '@chakra-ui/react'
import React from 'react'
import { Layout } from '../components/Layout'
import OrgChart from '../components/OrgChart'



export default function OrganizationalPage() {
  return (
    <Layout>
            <Container maxW='container.lg' py={4}>

      <Heading>Organigramme</Heading>
      <OrgChart />
      </Container>

    </Layout>
  )
}

