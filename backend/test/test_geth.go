package main

import (
	"math/big"
	"strings"

	"github.com/VJoes/webconsole/backend/geth"
	"github.com/VJoes/webconsole/backend/logger"
	"github.com/ethereum/go-ethereum/accounts/abi/bind"
	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/ethclient"
)

var keyStore = "{\"address\":\"f93169e562b36bdaa58a318fc48ace2c08612c4e\",\"crypto\":{\"cipher\":\"aes-128-ctr\",\"ciphertext\":\"8805629df621756a15c967cfb4d188c6bf61addfe1de40a1ab0124c3374661df\",\"cipherparams\":{\"iv\":\"a78e9388165ab50d209e4ce005ab3a67\"},\"kdf\":\"scrypt\",\"kdfparams\":{\"dklen\":32,\"n\":262144,\"p\":1,\"r\":8,\"salt\":\"220ca15a7b6356940822e2694b52b887db8ccfd5991d60b2b649119f213e3dfb\"},\"mac\":\"b5133999390fdf94266a7656ec71a84963f1b9be017ed675b11597a208851e76\"},\"id\":\"5c52b11a-8d02-453c-8e61-f75941e9671c\",\"version\":3}"

func main() {
	gethClient, _ := ethclient.Dial("http://192.168.32.129:8545")
	if gethClient == nil {
		print("geth error")
	}
	contractAddress := "0xc2837F2EE7789a31E2BC8133363D7C9bBD34fDa7"
	coreNetworkAddress := "0xf93169e562b36bdaa58a318fc48ace2c08612c4e"
	gethToken, errCon := geth.NewMain(common.HexToAddress(contractAddress), gethClient)
	if errCon != nil {
		logger.InitLog.Errorf("Failed to instantiate a Token contract: %v", errCon)
		print("geth error")
	}

	keyBigInt := big.NewInt(1)
	ueIdBigInt := big.NewInt(208930000000007)
	opcBigInt := big.NewInt(1)
	default5QiBigInt := big.NewInt(1)

	trans, _ := bind.NewTransactor(strings.NewReader(keyStore), "11111111")
	t, err := gethToken.NewOneUE(trans, ueIdBigInt, keyBigInt, opcBigInt, default5QiBigInt)
	if err != nil {
		println(err)
	}

	println(t)

	// ueid := big.NewInt(208930000000004)

	a1, b1, c1, d1, err1 := gethToken.GetUEbySUPI(&bind.CallOpts{Pending: true, From: common.HexToAddress(coreNetworkAddress)}, ueIdBigInt)
	logger.WebUILog.Infoln(a1, b1, c1, d1)
	if err1 != nil {
		println(err1)
	}

}
