import {
  Button,
  Center,
  chakra,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Stack,
  useToast,
} from '@chakra-ui/react'
import React, { useState } from 'react'
import { useHistory } from 'react-router-dom'
import { Card } from '../components/Card'
import DividerWithText from '../components/DividerWithText'
import { Layout } from '../components/Layout'
import { useAuth } from '../contexts/AuthContext'

export default function ForgotPasswordPage() {
  const history = useHistory()
  const { forgotPassword } = useAuth()
  const toast = useToast()

  const [email, setEmail] = useState('')

  return (
    <Layout>
      <Heading textAlign='center' my={12}>
        Mot de passe oublié
      </Heading>
      <Card maxW='md' mx='auto' mt={4}>
        <chakra.form
          onSubmit={async e => {
            e.preventDefault()
            // your login logic here
            try {
              await forgotPassword(email)
              toast({
                description: `Un email est envoyé à ${email} avec les instruction pour redéfinir le mot de passe.`,
                status: 'success',
                duration: 9000,
                isClosable: true,
              })
            } catch (error) {
              console.log(error.message)
              toast({
                description: error.message,
                status: 'error',
                duration: 9000,
                isClosable: true,
              })
            }
          }}
        >
          <Stack spacing='6'>
            <FormControl id='email'>
              <FormLabel>Adresse email</FormLabel>
              <Input
                name='email'
                type='email'
                autoComplete='email'
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </FormControl>
            <Button type='submit' colorScheme='pink' size='lg' fontSize='md'>
              Envoyer
            </Button>
          </Stack>
        </chakra.form>
        <DividerWithText my={6}>OR</DividerWithText>
        <Center>
          <Button variant='link' onClick={() => history.push('/login')}>
            Se connecter
          </Button>
        </Center>
      </Card>
    </Layout>
  )
}
