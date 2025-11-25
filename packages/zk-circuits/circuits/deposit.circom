template DepositCommitment() {
    // Public signals
    signal output commitment;

    // Private signals
    signal input pk;        // public key / address encoding
    signal input amount;    // deposit amount
    signal input blinding;  // random blinding factor

    // Very naive "commitment" example:
    // commitment = pk * 3 + amount * 5 + blinding * 7
    // This is NOT secure. It is just a placeholder expression.
    signal temp1;
    signal temp2;

    temp1 <== pk * 3 + amount * 5;
    temp2 <== blinding * 7;
    commitment <== temp1 + temp2;
}

component main = DepositCommitment();
