import React, { useState, useEffect } from 'react';
import { Box, Button, Heading, Flex, Text, Spinner, useToast, Grid, Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton, Input, useDisclosure, IconButton } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { EditIcon } from '@chakra-ui/icons';

interface WalletAsset {
  id: string;
  identifier: string;
  class: string;
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

function formatDate(dateString: string) {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  const pad = (n: number) => n.toString().padStart(2, '0');
  return (
    pad(date.getDate()) +
    '/' +
    pad(date.getMonth() + 1) +
    '/' +
    date.getFullYear() +
    ' ' +
    pad(date.getHours()) +
    ':' +
    pad(date.getMinutes()) +
    ':' +
    pad(date.getSeconds())
  );
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
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [newWalletName, setNewWalletName] = useState('');
  const [creatingWallet, setCreatingWallet] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingWalletId, setEditingWalletId] = useState<string | null>(null);
  const [editingWalletName, setEditingWalletName] = useState('');
  const [updatingWallet, setUpdatingWallet] = useState(false);

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

  const handleCreateWallet = async () => {
    if (!newWalletName.trim()) {
      toast({
        title: 'Error',
        description: 'Wallet name cannot be empty.',
        status: 'error',
        duration: 3000,
        isClosable: true,
        position: 'top',
      });
      return;
    }
    setCreatingWallet(true);
    try {
      await axios.post(
        'http://localhost:8081/v1/wallets',
        { name: newWalletName },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNewWalletName('');
      onClose();
      setLoading(true);
      // Re-fetch wallets
      const response = await axios.get('http://localhost:8081/v1/wallets', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const walletsData = response.data.map((wallet: any) => ({ ...wallet, walletAssets: [] }));
      setWallets(walletsData);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to create wallet.';
      toast({
        title: 'Error',
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top',
      });
    } finally {
      setCreatingWallet(false);
      setLoading(false);
    }
  };

  const openEditModal = (wallet: Wallet) => {
    setEditingWalletId(wallet.id);
    setEditingWalletName(wallet.name);
    setEditModalOpen(true);
  };

  const closeEditModal = () => {
    setEditModalOpen(false);
    setEditingWalletId(null);
    setEditingWalletName('');
  };

  const handleUpdateWallet = async () => {
    if (!editingWalletName.trim() || !editingWalletId) {
      toast({
        title: 'Error',
        description: 'Wallet name cannot be empty.',
        status: 'error',
        duration: 3000,
        isClosable: true,
        position: 'top',
      });
      return;
    }
    setUpdatingWallet(true);
    try {
      await axios.patch(
        `http://localhost:8081/v1/wallets/${editingWalletId}`,
        { name: editingWalletName },
        { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
      );
      closeEditModal();
      setLoading(true);
      // Re-fetch wallets
      const response = await axios.get('http://localhost:8081/v1/wallets', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const walletsData = response.data.map((wallet: any) => ({ ...wallet, walletAssets: [] }));
      setWallets(walletsData);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to update wallet.';
      toast({
        title: 'Error',
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top',
      });
    } finally {
      setUpdatingWallet(false);
      setLoading(false);
    }
  };

  return (
    <Box bg="gray.100" width="100vw" minHeight="100vh">
      <Box>
        <Flex p={10} justify="space-between" align="center" mb={4} bg="white" boxShadow={"lg"} width="100vw">
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

          <Flex gap={4}>
            <Button width="100px" colorScheme="blue" onClick={handleLogout}>
              Logout
            </Button>
          </Flex>
        </Flex>

        <Text style={{ fontSize: 50 }} color="gray.700" align={"center"} mt={10}>
          Welcome to your financial dashboard.
        </Text>

        <Box width="80%" mx="auto" mt={20}>
          <Flex align="center" justify="space-between" mb={4}>
            <Text
              style={{ fontSize: 25 }}
              color="gray.600"
              textAlign="left"
              fontWeight="bold"
            >
              Your wallets
            </Text>
            <Button width="100px" colorScheme="blue" onClick={onOpen}>
              New
            </Button>
          </Flex>
          <Box
            border="2px solid black"
            borderRadius="0"
            p={0}
            boxShadow="lg"
            overflow="hidden"
            width="100%"
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
                    <Flex gap={6} align="center">
                      <Text>{formatDate(wallet.createdAt)}</Text>
                      <Text fontWeight="bold">
                        {wallet.sum.toFixed(2)}
                      </Text>
                      <IconButton
                        aria-label="Edit wallet name"
                        icon={<EditIcon color="white" />} 
                        size="sm"
                        colorScheme="blue"
                        variant="ghost"
                        ml={2}
                        onClick={(e) => {
                          e.stopPropagation();
                          openEditModal(wallet);
                        }}
                      />
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
                        <Grid templateColumns="repeat(8, 1fr)" gap={2} alignItems="center">
                          <Text>Identifier</Text>
                          <Text>Class</Text>
                          <Text>Name</Text>
                          <Text>Custody</Text>
                          <Text>Asset</Text>
                          <Text>Total</Text>
                          <Text>Yield</Text>
                          <Text>Acquired at</Text>
                        </Grid>
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
                            <Grid templateColumns="repeat(8, 1fr)" gap={2} alignItems="center">
                              <Text>{asset.identifier}</Text>
                              <Text>{asset.class}</Text>
                              <Text>{asset.name}</Text>
                              <Text>{asset.custody}</Text>
                              <Text>{asset.asset}</Text>
                              <Text>{asset.currency + " " + asset.total}</Text>
                              <Text>{asset.yield + "%"}</Text>
                              <Text>{formatDate(asset.acquired)}</Text>
                            </Grid>
                          </Box>
                        ))
                      )}
                    </Box>
                  )}
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
        {/* New Wallet Modal */}
        <Modal isOpen={isOpen} onClose={onClose} isCentered>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Create New Wallet</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Input
                placeholder="Wallet name"
                value={newWalletName}
                onChange={e => setNewWalletName(e.target.value)}
                autoFocus
                mb={4}
              />
            </ModalBody>
            <ModalFooter>
              <Button colorScheme="blue" mr={3} onClick={handleCreateWallet} isLoading={creatingWallet}>
                Confirm
              </Button>
              <Button variant="ghost" onClick={onClose}>
                Cancel
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
        {/* Edit Wallet Modal */}
        <Modal isOpen={editModalOpen} onClose={closeEditModal} isCentered>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Edit Wallet Name</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Input
                placeholder="Wallet name"
                value={editingWalletName}
                onChange={e => setEditingWalletName(e.target.value)}
                autoFocus
                mb={4}
              />
            </ModalBody>
            <ModalFooter>
              <Button colorScheme="blue" mr={3} onClick={handleUpdateWallet} isLoading={updatingWallet}>
                Confirm
              </Button>
              <Button variant="ghost" onClick={closeEditModal}>
                Cancel
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </Box>
    </Box>
  );
};

export default Dashboard;