// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.0;

contract Transactions {
    uint256 transactionCounter;

    event Transfer(
        address from,
        address to,
        uint256 amount,
        string message,
        uint256 timestamp,
        string keyword
    );

    struct TransferSructure {
        address sender;
        address receiver;
        uint256 amount;
        string message;
        uint256 timestamp;
        string keyword;
    }

    TransferSructure[] public transactions;

    function transfer(
        address receiver,
        uint256 amount,
        string memory message,
        string memory keyword
    ) public {
        require(msg.sender.balance >= amount, "Balance not sufficient");
        payable(receiver).transfer(amount);
        transactionCounter++;
        emit Transfer(
            msg.sender,
            receiver,
            amount,
            message,
            block.timestamp,
            keyword
        );
        transactions.push(
            TransferSructure(
                msg.sender,
                receiver,
                amount,
                message,
                block.timestamp,
                keyword
            )
        );
    }

    function getTransactionCount() public view returns (uint256) {
        return transactionCounter;
    }

    function getTransactions() public view returns (TransferSructure[] memory) {
        return transactions;
    }
}
