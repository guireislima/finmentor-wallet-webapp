import React, { useState, useEffect } from 'react';
import { Box, Button, Heading, Flex, Text, Spinner, useToast, Grid, Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton, Input, useDisclosure, IconButton, Tabs, TabList, Tab, TabPanels, TabPanel, Select } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { EditIcon, DeleteIcon } from '@chakra-ui/icons';

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
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingWalletId, setDeletingWalletId] = useState<string | null>(null);
  const [deletingWallet, setDeletingWallet] = useState(false);
  const [assetTabIndex, setAssetTabIndex] = useState(0);
  const [fixedName, setFixedName] = useState('');
  const [fixedClass, setFixedClass] = useState('');
  const [fixedCurrency, setFixedCurrency] = useState('');
  const [fixedInterest, setFixedInterest] = useState('');
  const [fixedBase, setFixedBase] = useState('');
  const [variableName, setVariableName] = useState('');
  const [variableClass, setVariableClass] = useState('');
  const [variableCurrency, setVariableCurrency] = useState('');
  const [variableQuotation, setVariableQuotation] = useState('');
  const [creatingAsset, setCreatingAsset] = useState(false);

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

  const openDeleteModal = (wallet: Wallet) => {
    setDeletingWalletId(wallet.id);
    setDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setDeleteModalOpen(false);
    setDeletingWalletId(null);
  };

  const handleDeleteWallet = async () => {
    if (!deletingWalletId) return;
    setDeletingWallet(true);
    try {
      await axios.delete(`http://localhost:8081/v1/wallets/${deletingWalletId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      closeDeleteModal();
      setLoading(true);
      // Re-fetch wallets
      const response = await axios.get('http://localhost:8081/v1/wallets', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const walletsData = response.data.map((wallet: any) => ({ ...wallet, walletAssets: [] }));
      setWallets(walletsData);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to delete wallet.';
      toast({
        title: 'Error',
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top',
      });
    } finally {
      setDeletingWallet(false);
      setLoading(false);
    }
  };

  const handleCreateAsset = async () => {
    let name, shortName, type, currency, value, valueBase, assetClass;
    if (assetTabIndex === 0) {
      // Fixed
      name = fixedName.trim();
      shortName = name.slice(0, 3).toUpperCase();
      type = 'FIXED_ASSET';
      currency = fixedCurrency.trim();
      value = fixedInterest.trim();
      valueBase = fixedBase.trim();
      assetClass = fixedClass.trim();
      if (!name || !currency || !value || !valueBase || !assetClass) {
        toast({
          title: 'Error',
          description: 'Please fill all mandatory fields for Fixed Asset.',
          status: 'error',
          duration: 4000,
          isClosable: true,
          position: 'top',
        });
        return;
      }
    } else {
      // Variable
      name = variableName.trim();
      shortName = name.slice(0, 3).toUpperCase();
      type = 'VARIABLE_ASSET';
      currency = variableCurrency.trim();
      value = variableQuotation.trim();
      assetClass = variableClass.trim();
      if (!name || !currency || !value || !assetClass) {
        toast({
          title: 'Error',
          description: 'Please fill all mandatory fields for Variable Asset.',
          status: 'error',
          duration: 4000,
          isClosable: true,
          position: 'top',
        });
        return;
      }
    }
    const body = {
      name,
      shortName,
      type,
      currency,
      value,
      ...(assetTabIndex === 0 ? { valueBase } : {}),
      class: assetClass,
    };
    setCreatingAsset(true);
    try {
      await axios.post('http://localhost:8081/v1/assets', body, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast({
        title: 'Success',
        description: 'Asset created successfully!',
        status: 'success',
        duration: 4000,
        isClosable: true,
        position: 'top',
      });
      // Optionally clear fields
      setFixedName(''); setFixedClass(''); setFixedCurrency(''); setFixedInterest(''); setFixedBase('');
      setVariableName(''); setVariableClass(''); setVariableCurrency(''); setVariableQuotation('');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to create asset.';
      toast({
        title: 'Error',
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'top',
      });
    } finally {
      setCreatingAsset(false);
    }
  };

  return (
    <Box bg="gray.100" width="100vw" minHeight="100vh" display="flex" flexDirection="column">
      <Box flex="1">
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
        </Box>

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
                      <Text>Created at {formatDate(wallet.createdAt)}</Text>
                      
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
                      <IconButton
                        aria-label="Delete wallet"
                        icon={<DeleteIcon color="white" />} 
                        size="sm"
                        colorScheme="red"
                        variant="ghost"
                        ml={2}
                        onClick={(e) => {
                          e.stopPropagation();
                          openDeleteModal(wallet);
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
                        <Grid templateColumns="repeat(7, 1fr)" gap={2} alignItems="center">
                          <Text>Class</Text>
                          <Text>Name</Text>
                          <Text>Custody</Text>
                          <Text>Asset</Text>
                          <Text>Acquired at</Text>
                          <Text>Value</Text>
                          <Text>Yield</Text>
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
                            <Grid templateColumns="repeat(7, 1fr)" gap={2} alignItems="center">
                              <Text>{asset.class}</Text>
                              <Text>{asset.name}</Text>
                              <Text>{asset.custody}</Text>
                              <Text>{asset.asset}</Text>
                              <Text>{formatDate(asset.acquired)}</Text>
                              <Text>{asset.currency + " " + asset.total.toFixed(2)}</Text>
                              <Text>{asset.yield + "%"}</Text>
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
        {/* Create New Asset Section */}
        <Box width="40%" ml="10%" mt={16} mb={16}>
          <Box border="2px solid black" bg="white" boxShadow="lg" borderRadius="0" p={8} position="relative">
            <Text fontSize={25} color="gray.600" fontWeight="bold" mb={4}>
              Create new asset
            </Text>
            <Tabs variant="unstyled" colorScheme="blue" index={assetTabIndex} onChange={setAssetTabIndex}>
              <TabList mb={6}>
                <Tab _selected={{ bg: 'blue.500', color: 'white' }} fontWeight="bold" borderTopLeftRadius="md" borderTopRightRadius="md" px={8} py={2} mr={2}>Fixed</Tab>
                <Tab _selected={{ bg: 'blue.500', color: 'white' }} fontWeight="bold" borderTopLeftRadius="md" borderTopRightRadius="md" px={8} py={2}>Variable</Tab>
              </TabList>
              <TabPanels>
                {/* Fixed Tab */}
                <TabPanel px={0}>
                  <Box as="form" width="100%">
                    <Flex align="center" mb={4} width="90%">
                      <Text minW="90px" color="gray.700" fontWeight="medium" textAlign="right" mr={4}>Name</Text>
                      <Input borderRadius="0" height="36px" width="100%" value={fixedName} onChange={e => setFixedName(e.target.value)} />
                    </Flex>
                    <Flex align="center" mb={4} width="50%">
                      <Text minW="90px" color="gray.700" fontWeight="medium" textAlign="right" mr={4}>Class</Text>
                      <Select borderRadius="0" height="36px" width="100%" value={fixedClass} onChange={e => setFixedClass(e.target.value)}>
                        <option value="">Select class</option>
                        <option value="Tesouro">Tesouro direto</option>
                        <option value="CDB">CDB</option>
                        <option value="LCI">LCI</option>
                        <option value="LCA">LCA</option>
                        <option value="FundoRF">Fundo de renda fixa</option>
                      </Select>
                    </Flex>
                    <Flex align="center" mb={4} width="25%">
                      <Text minW="90px" color="gray.700" fontWeight="medium" textAlign="right" mr={4}>Currency</Text>
                      <Input borderRadius="0" height="36px" width="100%" value={fixedCurrency} onChange={e => setFixedCurrency(e.target.value)} />
                    </Flex>
                    <Flex align="center" mb={4} width="90%">
                      <Text minW="90px" color="gray.700" fontWeight="medium" textAlign="right" mr={4}>Interest (%)</Text>
                      <Input borderRadius="0" height="36px" width="30%" mr={6} value={fixedInterest} onChange={e => setFixedInterest(e.target.value)} />
                      <Text minW="40px" color="gray.700" fontWeight="medium" textAlign="right" mr={4}>Base</Text>
                      <Select borderRadius="0" height="36px" width="80%" value={fixedBase} onChange={e => setFixedBase(e.target.value)}>
                        <option value="">Select base</option>
                        <option value="CDI">CDI</option>
                        <option value="SELIC">SELIC</option>
                        <option value="IPCA">IPCA</option>
                      </Select>
                    </Flex>
                  </Box>
                </TabPanel>
                {/* Variable Tab */}
                <TabPanel px={0}>
                  <Box as="form" width="100%">
                    <Flex align="center" mb={4} width="90%">
                      <Text minW="90px" color="gray.700" fontWeight="medium" textAlign="right" mr={4}>Name</Text>
                      <Input borderRadius="0" height="36px" width="100%" value={variableName} onChange={e => setVariableName(e.target.value)} />
                    </Flex>
                    <Flex align="center" mb={4} width="50%">
                      <Text minW="90px" color="gray.700" fontWeight="medium" textAlign="right" mr={4}>Class</Text>
                      <Select borderRadius="0" height="36px" width="100%" value={variableClass} onChange={e => setVariableClass(e.target.value)}>
                        <option value="">Select class</option>
                        <option value="Ação">Ação</option>
                        <option value="FII">FII</option>
                        <option value="Stock">Stock</option>
                        <option value="REIT">REIT</option>
                        <option value="Criptomoeda">Criptomoeda</option>
                        <option value="Multimercado">Fundo multimercado</option>
                      </Select>
                    </Flex>
                    <Flex align="center" mb={4} width="25%">
                      <Text minW="90px" color="gray.700" fontWeight="medium" textAlign="right" mr={4}>Currency</Text>
                      <Input borderRadius="0" height="36px" width="100%" value={variableCurrency} onChange={e => setVariableCurrency(e.target.value)} />
                    </Flex>
                    <Flex align="center" mb={4} width="50%">
                      <Text minW="90px" color="gray.700" fontWeight="medium" textAlign="right" mr={4}>Quotation</Text>
                      <Input borderRadius="0" height="36px" width="100%" value={variableQuotation} onChange={e => setVariableQuotation(e.target.value)} />
                    </Flex>
                  </Box>
                </TabPanel>
              </TabPanels>
            </Tabs>
            <Flex justify="flex-end" mt={4}>
              <Button colorScheme="blue" width="150px" borderRadius="0" onClick={handleCreateAsset} isLoading={creatingAsset}>Create</Button>
            </Flex>
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
        {/* Delete Wallet Modal */}
        <Modal isOpen={deleteModalOpen} onClose={closeDeleteModal} isCentered>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Delete Wallet</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Text>Are you sure you want to delete this wallet? This action cannot be undone.</Text>
            </ModalBody>
            <ModalFooter>
              <Button colorScheme="red" mr={3} onClick={handleDeleteWallet} isLoading={deletingWallet}>
                Delete
              </Button>
              <Button variant="ghost" onClick={closeDeleteModal}>
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