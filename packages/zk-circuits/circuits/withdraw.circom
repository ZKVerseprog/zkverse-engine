template WithdrawNullifier() {
    // Public signals
    signal input commitment;
    signal output nullifier;

    // Private signals
    signal input secret;

    // Placeholder relation:
    // nullifier = commitment * 11 + secret * 13
    // Again, this is NOT cryptographically secure. It is a placeholder.
    signal temp;

    temp <== commitment * 11;
    nullifier <== temp + secret * 13;
}

component main = WithdrawNullifier();
