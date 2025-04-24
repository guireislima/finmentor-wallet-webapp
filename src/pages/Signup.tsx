import React from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { Box, Button, FormControl, FormLabel, Input, VStack, useToast, FormErrorMessage, Flex, Link, Select } from '@chakra-ui/react';
import api from '../api/axios';

interface SignupFormData {
  login: string;
  password: string;
  name: string;
  email: string;
  role: string;
}

const Signup: React.FC = () => {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<SignupFormData>();
  const navigate = useNavigate();
  const toast = useToast();

  const onSubmit = async (data: SignupFormData) => {
    try {
      const response = await api.post('/users', data);
      toast({
        title: 'Account created successfully',
        description: response.data?.message || 'Your account has been created',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      navigate('/login');
    } catch (error: any) {
      console.error('Signup error:', error);
      
      let errorMessage = 'An error occurred during signup';
      let errorTitle = 'Signup failed';
      
      if (error.response) {
        errorMessage = error.response.data?.message || 
                      error.response.data?.error || 
                      'Invalid data provided';
        errorTitle = error.response.data?.title || 'Signup failed';
      } else if (error.request) {
        errorMessage = 'No response from server';
      } else {
        errorMessage = error.message;
      }

      toast({
        title: errorTitle,
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top',
      });
    }
  };

  return (
    <Box width="100vw" height="100vh">
      <Flex minH="100vh" align="center" justify="center" width="100%">
        <Box width="400px" p={6} borderWidth="1px" borderRadius="lg" boxShadow="lg">
          <form onSubmit={handleSubmit(onSubmit)}>
            <VStack spacing={4}>
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

              <FormControl isInvalid={!!errors.name}>
                <FormLabel>Name</FormLabel>
                <Input
                  {...register('name', { required: 'Name is required' })}
                  placeholder="Enter your name"
                />
                <FormErrorMessage>
                  {errors.name && errors.name.message}
                </FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={!!errors.email}>
                <FormLabel>Email</FormLabel>
                <Input
                  type="email"
                  {...register('email', { 
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address'
                    }
                  })}
                  placeholder="Enter your email"
                />
                <FormErrorMessage>
                  {errors.email && errors.email.message}
                </FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={!!errors.role}>
                <FormLabel>Role</FormLabel>
                <Select
                  {...register('role', { required: 'Role is required' })}
                  placeholder="Select your role"
                >
                  <option value="ROLE_ADMIN">Admin</option>
                  <option value="ROLE_CUSTOMER">Customer</option>
                </Select>
                <FormErrorMessage>
                  {errors.role && errors.role.message}
                </FormErrorMessage>
              </FormControl>

              <Button 
                type="submit"
                colorScheme="blue" 
                width="full"
                isLoading={isSubmitting}
              >
                Create Account
              </Button>

              <Link as={RouterLink} to="/login" color="blue.500" alignSelf="center">
                Already have an account? Login
              </Link>
            </VStack>
          </form>
        </Box>
      </Flex>
    </Box>
  );
};

export default Signup; 