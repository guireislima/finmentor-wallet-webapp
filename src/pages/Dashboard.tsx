import React, { useState, useEffect } from 'react';
import { Box, Button, Heading, Flex, Text, Spinner, useToast } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

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
  const token = localStorage.getItem('token');
  const toast = useToast();
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [expandedIds, setExpandedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingAssets, setLoadingAssets] = useState<string | null>(null);

  const rowColors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEEAD'];

  useEffect(() => {
    const fetchWallets = async () => {
      try {
        console.log('Token:', token);
        const response = await axios.get('http://localhost:8081/v1/wallets', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        console.log('Wallets response:', response.data);
        const walletsData = response.data.map((wallet: any) => ({
          ...wallet,
          walletAssets: [],
        }));
        setWallets(walletsData);
      } catch (error: any) {
        const errorMessage = error.response?.data?.message || 'Failed to fetch wallets.';
        toast({
          title: 'Error',
          description: errorMessage,
          status: 'error',
          duration: 5000,
          isClosable: true,
          position: 'top',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchWallets();
  }, [toast, token]);

  const fetchWalletAssets = async (walletId: string) => {
    setLoadingAssets(walletId);
    try {
      const response = await axios.get(`http://localhost:8081/v1/wallets/${walletId}/assets`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const assets = response.data.assets;
      setWallets((prevWallets) =>
        prevWallets.map((wallet) =>
          wallet.id === walletId ? { ...wallet, walletAssets: assets } : wallet
        )
      );
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || `Failed to fetch assets for wallet ${walletId}.`;
      console.error(errorMessage);
    } finally {
      setLoadingAssets(null);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleRowClick = (id: string) => {
    if (!expandedIds.includes(id)) {
      fetchWalletAssets(id);
    }
    setExpandedIds((prevIds) =>
      prevIds.includes(id)
        ? prevIds.filter((expandedId) => expandedId !== id)
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
          {loading ? (
            <Spinner size="xl" color="blue.500" />
          ) : (
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
                            <Text>Custody</Text>
                            <Text>Asset</Text>
                            <Text>Total</Text>
                            <Text>Yield</Text>
                            <Text>Acquired at</Text>
                          </Flex>
                        </Box>
                        {loadingAssets === wallet.id ? (
                          <Spinner size="md" color="blue.500" />
                        ) : (
                          wallet.walletAssets.map((asset, assetIndex) => (
                            <Box
                              key={asset.id}
                              p={4}
                              bg={assetIndex % 2 === 0 ? "gray.50" : "gray.100"}
                              borderBottom="1px solid gray"
                            >
                              <Flex justify="space-between">
                                <Text>{asset.identifier}</Text>
                                <Text>{asset.name}</Text>
                                <Text>{asset.custody}</Text>
                                <Text>{asset.asset}</Text>
                                <Text>{asset.currency + " " + asset.total}</Text>
                                <Text>{asset.yield + "%"}</Text>
                                <Text>{asset.acquired}</Text>
                              </Flex>
                            </Box>
                          ))
                        )}
                      </Box>
                    )}
                  </Box>
                </Box>
              ))}
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default Dashboard;