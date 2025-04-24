import React from 'react';
import { Box, Button, Heading, Text, VStack } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Box p={8}>
      <VStack spacing={8} align="stretch">
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Heading>Dashboard</Heading>
          <Button colorScheme="red" onClick={handleLogout}>
            Logout
          </Button>
        </Box>
        
        <Box>
          <Text fontSize="xl">Welcome to your Financial Dashboard</Text>
          <Text mt={4}>Here you can manage your wallets and assets.</Text>
        </Box>
      </VStack>
    </Box>
  );
};

export default Dashboard;