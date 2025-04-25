import React from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { Box, Button, FormControl, FormLabel, Input, VStack, useToast, FormErrorMessage, Flex, Link } from '@chakra-ui/react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

interface LoginFormData {
  login: string;
  password: string;
}

const Login: React.FC = () => {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginFormData>();
  const navigate = useNavigate();
  const { login } = useAuth();
  const toast = useToast();

  const onSubmit = async (data: LoginFormData) => {
    try {
      console.log('Submitting login form with data:', data);
      const response = await api.post('/login', data);
      console.log('Login response:', response);
      
      if (response.data && response.data.accessToken) {
        login(response.data.accessToken);
        toast({
          title: 'Login successful',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        navigate('/dashboard');
      } else {
        throw new Error('No access token received from server');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      
      let errorMessage = 'An error occurred during login';
      
      if (error.response) {
        console.error('Error response:', error.response);
        errorMessage = error.response.data?.message || 'Invalid credentials';
      } else if (error.request) {
        console.error('Error request:', error.request);
        errorMessage = 'No response from server';
      } else {
        console.error('Error message:', error.message);
        errorMessage = error.message;
      }

      toast({
        title: 'Login failed',
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top',
      });
    }
  };

  const handleLoginClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    const formData = handleSubmit(onSubmit);
    await formData();
  };

  return (
    <Box bg="gray.100" width="100vw" height="100vh">
      <Flex minH="100vh" align="center" justify="center" width="100%">
        <Box bg="white" width="400px" p={6} borderWidth="1px" borderRadius="lg" boxShadow="lg">
          <form onSubmit={handleSubmit(onSubmit)}>
            <VStack gap={4}>
              <FormControl isInvalid={!!errors.login}>
                <FormLabel>Login</FormLabel>
                <Input
                  {...register('login', { required: 'Login is required' })}
                  placeholder="Enter your login"
                />
                <FormErrorMessage>
                  {errors.login && errors.login.message}
                </FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={!!errors.password}>
                <FormLabel>Password</FormLabel>
                <Input
                  type="password"
                  {...register('password', { required: 'Password is required' })}
                  placeholder="Enter your password"
                />
                <FormErrorMessage>
                  {errors.password && errors.password.message}
                </FormErrorMessage>
              </FormControl>

              <Button 
                type="submit"
                colorScheme="blue" 
                width="full"
                isLoading={isSubmitting}
              >
                Login
              </Button>

              <Link as={RouterLink} to="/signup" color="blue.500" alignSelf="center">
                Or create new account
              </Link>
            </VStack>
          </form>
        </Box>
      </Flex>
    </Box>
  );
};

export default Login;