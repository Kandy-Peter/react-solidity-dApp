import React, { useState, useEffect } from "react";

import { ethers } from "ethers";

import { contractAbi, contractAddress } from "../utils/constants";

export const TransactionContext = React.createContext();

// Get the ethereum object from the window object thnnks to the metamask extension
const { ethereum } = window;

// Create a provider object from the ethereum object

const getEthereumContract = () => {
  const provider = new ethers.providers.Web3Provider(ethereum);
  const signer = provider.getSigner();
  const transactionContract = new ethers.Contract(
    contractAddress,
    contractAbi,
    signer
  );

  return transactionContract;
};

export const TransactionProvider = ({ children }) => {
  const [currentAccount, setCurrentAccount] = useState("");
  const [formData, setFormData] = useState({
    addressTo: "",
    amount: "",
    keyword: "",
    message: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [transactionCount, setTransactionCount] = useState(
    localStorage.getItem("transactionCount")
  );
  const [transactions, setTransactions] = useState([]);

  const handleChange = (e, name) => {
    const { value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const getAllTransactions = async () => {
    try {
      if (!ethereum) return alert("Please install MetaMask");

      const transactionContract = await getEthereumContract();
      const transactionAvailable = await transactionContract.getTransactions();

      const transactionsStructured = transactionAvailable.map((transaction) => ({
				addressFrom: transaction.sender,
				addressTo: transaction.receiver,
				amount: parseInt(transaction.amount._hex) / (10 ** 18),
				keyword: transaction.keyword,
				message: transaction.message,
				timestamp:  new Date(transaction.timestamp.toNumber() * 1000).toLocaleString(),
      }));

      console.log(transactionsStructured);
			setTransactions(transactionsStructured);
    } catch (error) {
      console.log(error);
      throw new Error("Error getting all transactions");
    }
  };

  const checkWalletConnection = async () => {
    try {
      const accounts = await ethereum.request({ method: "eth_accounts" });
      if (accounts.length !== 0) {
        setCurrentAccount(accounts[0]);
        getEthereumContract();
      } else {
        console.log("No authorized account found. Please, install MetaMask");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const connectWallet = async () => {
    try {
      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });
      setCurrentAccount(accounts[0]);
      getEthereumContract();
      console.log("Connected account:", accounts[0]);
    } catch (error) {
      console.log(error);

      throw new Error("Error connecting to wallet");
    }
  };

  const checkTransactionExistence = async () => {
    try {
      const transactionContract = getEthereumContract();
      const currentTransactionCount =
        await transactionContract.getTransactionCount();

      window.localStorage.setItem("transactionCount", currentTransactionCount);
    } catch (error) {
      console.log(error);
      throw new Error("Error checking transaction existence");
    }
  };

  const sendTransaction = async () => {
    try {
      if (!ethereum) return alert("Please install MetaMask");

      const { addressTo, amount, keyword, message } = formData;
      const transactionContract = getEthereumContract();
      const parsedAmount = ethers.utils.parseEther(amount);

			await ethereum.request({
				method: "eth_sendTransaction",
				params: [{
					from: currentAccount,
					to: addressTo,
					gas: '0xF4240',
					value: parsedAmount._hex, // 0,0001 ETH
				}],
			});

      // call the transfer function from the contract to store the transaction to the blockchain

      const transactionHash = await transactionContract.transfer(
        addressTo,
        parsedAmount,
        keyword,
        message
      );

      setIsLoading(true);
      console.log("Transaction hash:", transactionHash.hash);

      await transactionHash.wait();
      setIsLoading(false);
      console.log("Transaction successful");

      const transactionCount = await transactionContract.getTransactionCount();

      setTransactionCount(transactionCount.toNumber());
			window.location.reload();
    } catch (error) {
      console.log(error);
      throw new Error("Error sending transaction");
    }
  };

  useEffect(() => {
    if (ethereum) {
      checkWalletConnection();
      getAllTransactions();
      checkTransactionExistence();
    }
  }, [transactionCount]);

  return (
    <TransactionContext.Provider
      value={{
        connectWallet,
        currentAccount,
        formData,
        handleChange,
        sendTransaction,
        isLoading,
        transactionCount,
				transactions,
      }}
    >
      {children}
    </TransactionContext.Provider>
  );
};
