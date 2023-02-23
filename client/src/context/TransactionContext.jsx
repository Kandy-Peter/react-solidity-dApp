import React, { useState, useEffect } from 'react';

import { ethers } from 'ethers';

import { contractAbi, contractAddress } from '../utils/constants';

export const TransactionContext = React.createContext();


// Get the ethereum object from the window object thnnks to the metamask extension
const { ethereum } = window;

// Create a provider object from the ethereum object

const getEthereumContract = () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const transactionContract = new ethers.Contract(contractAddress, contractAbi, signer);

    console.log('transactionContract', transactionContract);
    console.log('provider', provider);
    console.log('signer', signer);
}

export const TransactionProvider = ({ children }) => {
    const [currentAccount, setCurrentAccount] = useState('');
    const [formData, setFormData] = useState({
        addressTo: '',
        amount: '',
        keyword: '',
        message: '',
    });
    const [isLoading, setIsLoading] = useState(false);
    const [transactionCount, setTransactionCount] = useState(localStorage.getItem('transactionCount') || 0);

    const handleChange = (e, name) => {
        const { value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const checkWalletConnection = async () => {
        try {
            const accounts = await ethereum.request({ method: 'eth_accounts' });
            if (accounts.length !== 0) {
                 setCurrentAccount(accounts[0]);
                getEthereumContract();
            } else {
                console.log('No authorized account found. Please, install MetaMask');
            }
        } catch (error) {
            console.log(error);
        }
    };

    const connectWallet = async () => {
        try {
            const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
             setCurrentAccount(accounts[0]);
            getEthereumContract();
            console.log('Connected account:', accounts[0])
        } catch (error) {
            console.log(error);

            throw new Error('Error connecting to wallet');
        }
    };

    const sendTransaction = async () => {
        try {
            if(!ethereum) return alert('Please install MetaMask');

            const { addressTo, amount, keyword, message } = formData;
            const transactionContract = getEthereumContract();
            const parsedAmount = ethers.utils.parseEther(amount)

            await ethereum.request({
                method: 'eth_sendTransaction',
                params: [
                    {
                        from: currentAccount,
                        to: addressTo,
                        value: parsedAmount._hex, // 0,0001 ETH
                        gas: 0*5208, // 5208 is the default gas limit equivalent to 21k Gwei
                    }
                ]
            })

            // call the transfer function from the contract to store the transaction to the blockchain

            const transactionHash = await transactionContract.transfer(addressTo, parsedAmount, keyword, message);

            setIsLoading(true);
            console.log('Transaction hash:', transactionHash.hash);

            await transactionHash.wait();
            setIsLoading(false);
            console.log('Transaction successful');

            const transactionCount = await transactionContract.getTransactionCount();

            setTransactionCount(transactionCount.toNumber());
            
        } catch (error) {
            console.log(error);
            throw new Error('Error sending transaction');
        }
    }

    useEffect(() => {
        if (ethereum) {
            checkWalletConnection();
            getEthereumContract();
        }
    }, [ethereum]);

    return (
        <TransactionContext.Provider value={{ connectWallet, currentAccount, formData, handleChange, sendTransaction, isLoading }}>
            {children}
        </TransactionContext.Provider>
    );
}
