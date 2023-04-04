import * as anchor from '@coral-xyz/anchor';
import { Program } from '@coral-xyz/anchor';

import {
	Keypair,
	LAMPORTS_PER_SOL,
	PublicKey,
	SystemProgram,
} from '@solana/web3.js';
import { assert, use } from 'chai';
import { Contacts } from '../target/types/contacts';

describe('contacts', () => {
	// Configure the client to use the local cluster.
	anchor.setProvider(anchor.AnchorProvider.env());

	const program = anchor.workspace.Contacts as Program<Contacts>;

	describe('create and follow profiles', () => {
		let user1 = new Keypair();
		let user2 = new Keypair();

		const [profile1Pda] = PublicKey.findProgramAddressSync(
			[Buffer.from('profile'), user1.publicKey.toBytes()],
			program.programId
		);

		const [profile2Pda] = PublicKey.findProgramAddressSync(
			[Buffer.from('profile'), user2.publicKey.toBytes()],
			program.programId
		);

		// profile1 follows profile2
		const [user1ToUser2Pda] = PublicKey.findProgramAddressSync(
			[Buffer.from('follow'), profile1Pda.toBytes(), profile2Pda.toBytes()],
			program.programId
		);

		// profile2 follows profile1
		const [user2ToUser1Pda] = PublicKey.findProgramAddressSync(
			[Buffer.from('follow'), profile2Pda.toBytes(), profile1Pda.toBytes()],
			program.programId
		);

		before(async () => {
			{
				const connection = program.provider.connection;
				const latestBlockHash = await connection.getLatestBlockhash();
				const signature = await connection.requestAirdrop(
					user1.publicKey,
					LAMPORTS_PER_SOL
				);

				await connection.confirmTransaction({
					blockhash: latestBlockHash.blockhash,
					lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
					signature,
				});
			}

			{
				const connection = program.provider.connection;
				const latestBlockHash = await connection.getLatestBlockhash();
				const signature = await connection.requestAirdrop(
					user2.publicKey,
					LAMPORTS_PER_SOL
				);

				await connection.confirmTransaction({
					blockhash: latestBlockHash.blockhash,
					lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
					signature,
				});
			}

			console.log(
				JSON.stringify(
					{
						user1: user1.publicKey,
						profile1Pda,
						user1ToUser2Pda,
						user2: user2.publicKey,
						profile2Pda,
						user2ToUser1Pda,
					},
					null,
					2
				)
			);
		});

		it('should be able to create a profile', async () => {
			const uri =
				'https://shdw-drive.genesysgo.net/EQUAMGwdZNwhuZxXVFeVmxVYd3ZWMhL1TYFoM1WScLgQ/sample.json';

			try {
				await program.methods
					.createProfile({
						name: 'Val',
						uri,
					})
					.accounts({
						owner: user1.publicKey,
						profile: profile1Pda,
						systemProgram: SystemProgram.programId,
					})
					.signers([user1])
					.rpc();
			} catch (e) {
				console.log(e);
				assert.ok(false);
			}

			try {
				await program.methods
					.createProfile({
						name: 'Dell',
						uri,
					})
					.accounts({
						owner: user2.publicKey,
						profile: profile2Pda,
						systemProgram: SystemProgram.programId,
					})
					.signers([user2])
					.rpc();
			} catch (e) {
				console.log(e);
				assert.ok(false);
			}

			assert.ok(true);
		});

		it('should be able to follow a profile', async () => {
			try {
				await program.methods
					.followProfile()
					.accounts({
						owner: user1.publicKey,
						followAccount: user1ToUser2Pda,
						ownerProfile: profile1Pda,
						profileToFollow: profile2Pda,
						systemProgram: SystemProgram.programId,
					})
					.signers([user1])
					.rpc();
			} catch (e) {
				console.log(e);
				assert.ok(false);
			}

			const profile1 = await program.account.profile.fetch(profile1Pda);
			const profile2 = await program.account.profile.fetch(profile2Pda);
			const user1ToUser2 = await program.account.follow.fetch(user1ToUser2Pda);

			console.log(
				JSON.stringify(
					{
						profile1,
						profile2,
						user1ToUser2,
					},
					null,
					2
				)
			);
		});

		it('should be able to query my followings', async () => {
			const accts = await program.account.follow.all([
				{
					memcmp: {
						bytes: profile1Pda.toBase58(),
						offset: 9,
					},
				},
			]);

			console.log(JSON.stringify(accts));
		});

		it('should be able to query my followers', async () => {
			const accts = await program.account.follow.all([
				{
					memcmp: {
						bytes: profile2Pda.toBase58(),
						offset: 9 + 32,
					},
				},
			]);

			console.log(JSON.stringify(accts));
		});

		// await program.account.follow.fetchOrNull(user1ToUser2)
		// await program.account.follow.fetch(user2ToUser1)
	});
});
