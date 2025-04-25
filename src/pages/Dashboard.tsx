import React, { useState } from 'react';
import { Box, Button, Heading, Flex, Text } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface WalletAsset {
  id: string;
  identifier: string;
  name: string;
  custody: string;
  asset: string;
  currency: string;
  total: number;
  yield: number;
  acquired: string;
}

interface Wallet {
  id: string;
  name: string;
  sum: number;
  createdAt: string;
  walletAssets: WalletAsset[];
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [expandedIds, setExpandedIds] = useState<string[]>([]);

  const rowColors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEEAD'];

  const wallets: Wallet[] = [
    {
      id: "1",
      name: "Wallet 1",
      sum: 150.75,
      createdAt: "2024-04-25",
      walletAssets: [{
        id: "1",
        identifier: "WA1",
        name: "Wallet Asset 1",
        custody: "Itaú",
        asset: "A1",
        currency: "R$",
        total: 150.75,
        yield: 100,
        acquired: "2024-04-25"
      }]
    },
    {
      id: "2",
      name: "Wallet 2",
      sum: 300,
      createdAt: "2024-04-25",
      walletAssets: [
        {
          id: "2",
          identifier: "WA2",
          name: "Wallet Asset 2",
          custody: "Itaú",
          asset: "A2",
          currency: "R$",
          total: 100,
          yield: 50,
          acquired: "2024-04-25"
        },
        {
          id: "3",
          identifier: "WA3",
          name: "Wallet Asset 3",
          custody: "Itaú",
          asset: "A3",
          currency: "R$",
          total: 200,
          yield: 50,
          acquired: "2024-04-25"
        }
      ]
    }
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleRowClick = (id: string) => {
    setExpandedIds(prevIds =>
      prevIds.includes(id)
        ? prevIds.filter(expandedId => expandedId !== id)
        : [...prevIds, id]
    );
  };

  return (
    <Box bg="gray.100" width="99.2vw" height="100%">
      <Box>
        <Flex p={10} justify="space-between" align="center" mb={4} bg="white" boxShadow={"lg"}>
          <Box>
            <Flex align="center" gap={4}>
              <Heading as="h1" size="2xl" fontWeight="bold" color="blue.500">
                Finmentor
              </Heading>
              <Text fontSize="3xl" color="blue.500" height="40px">|</Text>
              <Text fontSize="lg" color="black" height="16px">
                Wallets
              </Text>
            </Flex>
          </Box>

          <div style={{ position: "relative", float: "right" }}>
            <Button width="100px" colorScheme="blue" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </Flex>

        <Text style={{ fontSize: 50 }} color="gray.700" align={"center"} mt={10}>
          Welcome to your financial dashboard.
        </Text>

        <Text
          style={{ fontSize: 25 }}
          color="gray.600"
          textAlign="left"
          fontWeight="bold"
          ml="465px"
          mt="150px"
          mb="4"
        >
          Your wallets
        </Text>
        <Box
          height="calc(100vh - 200px)"
          display="flex"
          alignItems="center"
          flexDirection="column"
        >
          <Box
            border="2px solid black"
            borderRadius="0"
            p={0}
            mx="auto"
            maxWidth="1200px"
            boxShadow="lg"
            overflow="hidden"
            width="80%"
          >
            {wallets.map((wallet, index) => (
              <Box key={wallet.id}>
                <Box
                  p={6}
                  bg={rowColors[index % rowColors.length]}
                  cursor="pointer"
                  onClick={() => handleRowClick(wallet.id)}
                  _hover={{ filter: 'brightness(0.9)' }}
                  transition="all 0.2s"
                  borderRadius="0"
                  mb={0}
                  color="white"
                >
                  <Flex justify="space-between" align="center">
                    <Text fontWeight="medium" fontSize="lg">{wallet.name}</Text>
                    <Flex gap={6}>
                      <Text>{wallet.createdAt}</Text>
                      <Text fontWeight="bold">
                        ${wallet.sum.toFixed(2)}
                      </Text>
                    </Flex>
                  </Flex>
                </Box>

                <Box
                  p={6}
                  bg="white"
                  ml={0}
                  borderLeft="4px"
                  borderColor={rowColors[index % rowColors.length]}
                  mb={expandedIds.includes(wallet.id) ? 4 : 0}
                  boxShadow="md"
                  overflow="hidden"
                  height={expandedIds.includes(wallet.id) ? "auto" : "0"}
                  opacity={expandedIds.includes(wallet.id) ? 1 : 0}
                  transition="height 0.5s ease, opacity 0.5s ease, margin-bottom 0.3s ease"
                  padding={expandedIds.includes(wallet.id) ? 6 : 0}
                >
                  {expandedIds.includes(wallet.id) && (
                    <Box>
                      <Box
                        p={4}
                        bg="gray.200"
                        borderBottom="1px solid gray"
                        fontWeight="bold"
                      >
                        <Flex justify="space-between">
                          <Text>Identifier</Text>
                          <Text>Name</Text>
                          <Text>Total</Text>
                        </Flex>
                      </Box>
                      {wallet.walletAssets.map((asset, assetIndex) => (
                        <Box
                          key={asset.id}
                          p={4}
                          bg={assetIndex % 2 === 0 ? "gray.50" : "gray.100"}
                          borderBottom="1px solid gray"
                        >
                          <Flex justify="space-between">
                            <Text>{asset.identifier}</Text>
                            <Text>{asset.name}</Text>
                            <Text>{asset.total}</Text>
                          </Flex>
                        </Box>
                      ))}
                    </Box>
                  )}
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Dashboard;