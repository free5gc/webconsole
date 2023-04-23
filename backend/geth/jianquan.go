// Code generated - DO NOT EDIT.
// This file is a generated binding and any manual changes will be lost.

package geth

import (
	"math/big"
	"strings"

	ethereum "github.com/ethereum/go-ethereum"
	"github.com/ethereum/go-ethereum/accounts/abi"
	"github.com/ethereum/go-ethereum/accounts/abi/bind"
	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/core/types"
	"github.com/ethereum/go-ethereum/event"
)

// Reference imports to suppress errors if they are not otherwise used.
var (
	_ = big.NewInt
	_ = strings.NewReader
	_ = ethereum.NotFound
	_ = abi.U256
	_ = bind.Bind
	_ = common.Big1
	_ = types.BloomLookup
	_ = event.NewSubscription
)

// MainABI is the input ABI used to generate the binding from.
const MainABI = "[{\"constant\":true,\"inputs\":[{\"name\":\"x\",\"type\":\"uint256\"}],\"name\":\"getUEbySUPI\",\"outputs\":[{\"name\":\"\",\"type\":\"uint256\"},{\"name\":\"\",\"type\":\"uint256\"},{\"name\":\"\",\"type\":\"uint256\"},{\"name\":\"\",\"type\":\"uint256\"}],\"payable\":false,\"stateMutability\":\"view\",\"type\":\"function\"},{\"constant\":false,\"inputs\":[{\"name\":\"supi\",\"type\":\"uint256\"}],\"name\":\"deleteOneUE\",\"outputs\":[],\"payable\":false,\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"constant\":false,\"inputs\":[{\"name\":\"supi\",\"type\":\"uint256\"},{\"name\":\"pk\",\"type\":\"uint256\"},{\"name\":\"ocv\",\"type\":\"uint256\"},{\"name\":\"qi\",\"type\":\"uint256\"}],\"name\":\"newOneUE\",\"outputs\":[],\"payable\":false,\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"constant\":true,\"inputs\":[],\"name\":\"ac\",\"outputs\":[{\"name\":\"\",\"type\":\"uint256\"}],\"payable\":false,\"stateMutability\":\"view\",\"type\":\"function\"},{\"constant\":true,\"inputs\":[{\"name\":\"x\",\"type\":\"uint256\"}],\"name\":\"getOneUE\",\"outputs\":[{\"name\":\"\",\"type\":\"uint256\"},{\"name\":\"\",\"type\":\"uint256\"},{\"name\":\"\",\"type\":\"uint256\"},{\"name\":\"\",\"type\":\"uint256\"}],\"payable\":false,\"stateMutability\":\"view\",\"type\":\"function\"},{\"constant\":true,\"inputs\":[],\"name\":\"getAllUE\",\"outputs\":[{\"name\":\"\",\"type\":\"uint256\"}],\"payable\":false,\"stateMutability\":\"view\",\"type\":\"function\"},{\"constant\":true,\"inputs\":[{\"name\":\"\",\"type\":\"uint256\"}],\"name\":\"ues\",\"outputs\":[{\"name\":\"SUPI\",\"type\":\"uint256\"},{\"name\":\"PK\",\"type\":\"uint256\"},{\"name\":\"OperatorCodeValue\",\"type\":\"uint256\"},{\"name\":\"Default_5QI\",\"type\":\"uint256\"}],\"payable\":false,\"stateMutability\":\"view\",\"type\":\"function\"},{\"constant\":true,\"inputs\":[{\"name\":\"\",\"type\":\"uint256\"}],\"name\":\"a\",\"outputs\":[{\"name\":\"\",\"type\":\"uint256\"}],\"payable\":false,\"stateMutability\":\"view\",\"type\":\"function\"}]"

// Main is an auto generated Go binding around an Ethereum contract.
type Main struct {
	MainCaller     // Read-only binding to the contract
	MainTransactor // Write-only binding to the contract
	MainFilterer   // Log filterer for contract events
}

// MainCaller is an auto generated read-only Go binding around an Ethereum contract.
type MainCaller struct {
	contract *bind.BoundContract // Generic contract wrapper for the low level calls
}

// MainTransactor is an auto generated write-only Go binding around an Ethereum contract.
type MainTransactor struct {
	contract *bind.BoundContract // Generic contract wrapper for the low level calls
}

// MainFilterer is an auto generated log filtering Go binding around an Ethereum contract events.
type MainFilterer struct {
	contract *bind.BoundContract // Generic contract wrapper for the low level calls
}

// MainSession is an auto generated Go binding around an Ethereum contract,
// with pre-set call and transact options.
type MainSession struct {
	Contract     *Main             // Generic contract binding to set the session for
	CallOpts     bind.CallOpts     // Call options to use throughout this session
	TransactOpts bind.TransactOpts // Transaction auth options to use throughout this session
}

// MainCallerSession is an auto generated read-only Go binding around an Ethereum contract,
// with pre-set call options.
type MainCallerSession struct {
	Contract *MainCaller   // Generic contract caller binding to set the session for
	CallOpts bind.CallOpts // Call options to use throughout this session
}

// MainTransactorSession is an auto generated write-only Go binding around an Ethereum contract,
// with pre-set transact options.
type MainTransactorSession struct {
	Contract     *MainTransactor   // Generic contract transactor binding to set the session for
	TransactOpts bind.TransactOpts // Transaction auth options to use throughout this session
}

// MainRaw is an auto generated low-level Go binding around an Ethereum contract.
type MainRaw struct {
	Contract *Main // Generic contract binding to access the raw methods on
}

// MainCallerRaw is an auto generated low-level read-only Go binding around an Ethereum contract.
type MainCallerRaw struct {
	Contract *MainCaller // Generic read-only contract binding to access the raw methods on
}

// MainTransactorRaw is an auto generated low-level write-only Go binding around an Ethereum contract.
type MainTransactorRaw struct {
	Contract *MainTransactor // Generic write-only contract binding to access the raw methods on
}

// NewMain creates a new instance of Main, bound to a specific deployed contract.
func NewMain(address common.Address, backend bind.ContractBackend) (*Main, error) {
	contract, err := bindMain(address, backend, backend, backend)
	if err != nil {
		return nil, err
	}
	return &Main{MainCaller: MainCaller{contract: contract}, MainTransactor: MainTransactor{contract: contract}, MainFilterer: MainFilterer{contract: contract}}, nil
}

// NewMainCaller creates a new read-only instance of Main, bound to a specific deployed contract.
func NewMainCaller(address common.Address, caller bind.ContractCaller) (*MainCaller, error) {
	contract, err := bindMain(address, caller, nil, nil)
	if err != nil {
		return nil, err
	}
	return &MainCaller{contract: contract}, nil
}

// NewMainTransactor creates a new write-only instance of Main, bound to a specific deployed contract.
func NewMainTransactor(address common.Address, transactor bind.ContractTransactor) (*MainTransactor, error) {
	contract, err := bindMain(address, nil, transactor, nil)
	if err != nil {
		return nil, err
	}
	return &MainTransactor{contract: contract}, nil
}

// NewMainFilterer creates a new log filterer instance of Main, bound to a specific deployed contract.
func NewMainFilterer(address common.Address, filterer bind.ContractFilterer) (*MainFilterer, error) {
	contract, err := bindMain(address, nil, nil, filterer)
	if err != nil {
		return nil, err
	}
	return &MainFilterer{contract: contract}, nil
}

// bindMain binds a generic wrapper to an already deployed contract.
func bindMain(address common.Address, caller bind.ContractCaller, transactor bind.ContractTransactor, filterer bind.ContractFilterer) (*bind.BoundContract, error) {
	parsed, err := abi.JSON(strings.NewReader(MainABI))
	if err != nil {
		return nil, err
	}
	return bind.NewBoundContract(address, parsed, caller, transactor, filterer), nil
}

// Call invokes the (constant) contract method with params as input values and
// sets the output to result. The result type might be a single field for simple
// returns, a slice of interfaces for anonymous returns and a struct for named
// returns.
func (_Main *MainRaw) Call(opts *bind.CallOpts, result interface{}, method string, params ...interface{}) error {
	return _Main.Contract.MainCaller.contract.Call(opts, result, method, params...)
}

// Transfer initiates a plain transaction to move funds to the contract, calling
// its default method if one is available.
func (_Main *MainRaw) Transfer(opts *bind.TransactOpts) (*types.Transaction, error) {
	return _Main.Contract.MainTransactor.contract.Transfer(opts)
}

// Transact invokes the (paid) contract method with params as input values.
func (_Main *MainRaw) Transact(opts *bind.TransactOpts, method string, params ...interface{}) (*types.Transaction, error) {
	return _Main.Contract.MainTransactor.contract.Transact(opts, method, params...)
}

// Call invokes the (constant) contract method with params as input values and
// sets the output to result. The result type might be a single field for simple
// returns, a slice of interfaces for anonymous returns and a struct for named
// returns.
func (_Main *MainCallerRaw) Call(opts *bind.CallOpts, result interface{}, method string, params ...interface{}) error {
	return _Main.Contract.contract.Call(opts, result, method, params...)
}

// Transfer initiates a plain transaction to move funds to the contract, calling
// its default method if one is available.
func (_Main *MainTransactorRaw) Transfer(opts *bind.TransactOpts) (*types.Transaction, error) {
	return _Main.Contract.contract.Transfer(opts)
}

// Transact invokes the (paid) contract method with params as input values.
func (_Main *MainTransactorRaw) Transact(opts *bind.TransactOpts, method string, params ...interface{}) (*types.Transaction, error) {
	return _Main.Contract.contract.Transact(opts, method, params...)
}

// A is a free data retrieval call binding the contract method 0xf0fdf834.
//
// Solidity: function a(uint256 ) constant returns(uint256)
func (_Main *MainCaller) A(opts *bind.CallOpts, arg0 *big.Int) (*big.Int, error) {
	var (
		ret0 = new(*big.Int)
	)
	out := ret0
	err := _Main.contract.Call(opts, out, "a", arg0)
	return *ret0, err
}

// A is a free data retrieval call binding the contract method 0xf0fdf834.
//
// Solidity: function a(uint256 ) constant returns(uint256)
func (_Main *MainSession) A(arg0 *big.Int) (*big.Int, error) {
	return _Main.Contract.A(&_Main.CallOpts, arg0)
}

// A is a free data retrieval call binding the contract method 0xf0fdf834.
//
// Solidity: function a(uint256 ) constant returns(uint256)
func (_Main *MainCallerSession) A(arg0 *big.Int) (*big.Int, error) {
	return _Main.Contract.A(&_Main.CallOpts, arg0)
}

// Ac is a free data retrieval call binding the contract method 0x54b7c39b.
//
// Solidity: function ac() constant returns(uint256)
func (_Main *MainCaller) Ac(opts *bind.CallOpts) (*big.Int, error) {
	var (
		ret0 = new(*big.Int)
	)
	out := ret0
	err := _Main.contract.Call(opts, out, "ac")
	return *ret0, err
}

// Ac is a free data retrieval call binding the contract method 0x54b7c39b.
//
// Solidity: function ac() constant returns(uint256)
func (_Main *MainSession) Ac() (*big.Int, error) {
	return _Main.Contract.Ac(&_Main.CallOpts)
}

// Ac is a free data retrieval call binding the contract method 0x54b7c39b.
//
// Solidity: function ac() constant returns(uint256)
func (_Main *MainCallerSession) Ac() (*big.Int, error) {
	return _Main.Contract.Ac(&_Main.CallOpts)
}

// GetAllUE is a free data retrieval call binding the contract method 0xb6bbd4f9.
//
// Solidity: function getAllUE() constant returns(uint256)
func (_Main *MainCaller) GetAllUE(opts *bind.CallOpts) (*big.Int, error) {
	var (
		ret0 = new(*big.Int)
	)
	out := ret0
	err := _Main.contract.Call(opts, out, "getAllUE")
	return *ret0, err
}

// GetAllUE is a free data retrieval call binding the contract method 0xb6bbd4f9.
//
// Solidity: function getAllUE() constant returns(uint256)
func (_Main *MainSession) GetAllUE() (*big.Int, error) {
	return _Main.Contract.GetAllUE(&_Main.CallOpts)
}

// GetAllUE is a free data retrieval call binding the contract method 0xb6bbd4f9.
//
// Solidity: function getAllUE() constant returns(uint256)
func (_Main *MainCallerSession) GetAllUE() (*big.Int, error) {
	return _Main.Contract.GetAllUE(&_Main.CallOpts)
}

// GetOneUE is a free data retrieval call binding the contract method 0x56f06414.
//
// Solidity: function getOneUE(uint256 x) constant returns(uint256, uint256, uint256, uint256)
func (_Main *MainCaller) GetOneUE(opts *bind.CallOpts, x *big.Int) (*big.Int, *big.Int, *big.Int, *big.Int, error) {
	var (
		ret0 = new(*big.Int)
		ret1 = new(*big.Int)
		ret2 = new(*big.Int)
		ret3 = new(*big.Int)
	)
	out := &[]interface{}{
		ret0,
		ret1,
		ret2,
		ret3,
	}
	err := _Main.contract.Call(opts, out, "getOneUE", x)
	return *ret0, *ret1, *ret2, *ret3, err
}

// GetOneUE is a free data retrieval call binding the contract method 0x56f06414.
//
// Solidity: function getOneUE(uint256 x) constant returns(uint256, uint256, uint256, uint256)
func (_Main *MainSession) GetOneUE(x *big.Int) (*big.Int, *big.Int, *big.Int, *big.Int, error) {
	return _Main.Contract.GetOneUE(&_Main.CallOpts, x)
}

// GetOneUE is a free data retrieval call binding the contract method 0x56f06414.
//
// Solidity: function getOneUE(uint256 x) constant returns(uint256, uint256, uint256, uint256)
func (_Main *MainCallerSession) GetOneUE(x *big.Int) (*big.Int, *big.Int, *big.Int, *big.Int, error) {
	return _Main.Contract.GetOneUE(&_Main.CallOpts, x)
}

// GetUEbySUPI is a free data retrieval call binding the contract method 0x1ae24962.
//
// Solidity: function getUEbySUPI(uint256 x) constant returns(uint256, uint256, uint256, uint256)
func (_Main *MainCaller) GetUEbySUPI(opts *bind.CallOpts, x *big.Int) (*big.Int, *big.Int, *big.Int, *big.Int, error) {
	var (
		ret0 = new(*big.Int)
		ret1 = new(*big.Int)
		ret2 = new(*big.Int)
		ret3 = new(*big.Int)
	)
	out := &[]interface{}{
		ret0,
		ret1,
		ret2,
		ret3,
	}
	err := _Main.contract.Call(opts, out, "getUEbySUPI", x)
	return *ret0, *ret1, *ret2, *ret3, err
}

// GetUEbySUPI is a free data retrieval call binding the contract method 0x1ae24962.
//
// Solidity: function getUEbySUPI(uint256 x) constant returns(uint256, uint256, uint256, uint256)
func (_Main *MainSession) GetUEbySUPI(x *big.Int) (*big.Int, *big.Int, *big.Int, *big.Int, error) {
	return _Main.Contract.GetUEbySUPI(&_Main.CallOpts, x)
}

// GetUEbySUPI is a free data retrieval call binding the contract method 0x1ae24962.
//
// Solidity: function getUEbySUPI(uint256 x) constant returns(uint256, uint256, uint256, uint256)
func (_Main *MainCallerSession) GetUEbySUPI(x *big.Int) (*big.Int, *big.Int, *big.Int, *big.Int, error) {
	return _Main.Contract.GetUEbySUPI(&_Main.CallOpts, x)
}

// Ues is a free data retrieval call binding the contract method 0xbaf89bbe.
//
// Solidity: function ues(uint256 ) constant returns(uint256 SUPI, uint256 PK, uint256 OperatorCodeValue, uint256 Default_5QI)
func (_Main *MainCaller) Ues(opts *bind.CallOpts, arg0 *big.Int) (struct {
	SUPI              *big.Int
	PK                *big.Int
	OperatorCodeValue *big.Int
	Default5QI        *big.Int
}, error) {
	ret := new(struct {
		SUPI              *big.Int
		PK                *big.Int
		OperatorCodeValue *big.Int
		Default5QI        *big.Int
	})
	out := ret
	err := _Main.contract.Call(opts, out, "ues", arg0)
	return *ret, err
}

// Ues is a free data retrieval call binding the contract method 0xbaf89bbe.
//
// Solidity: function ues(uint256 ) constant returns(uint256 SUPI, uint256 PK, uint256 OperatorCodeValue, uint256 Default_5QI)
func (_Main *MainSession) Ues(arg0 *big.Int) (struct {
	SUPI              *big.Int
	PK                *big.Int
	OperatorCodeValue *big.Int
	Default5QI        *big.Int
}, error) {
	return _Main.Contract.Ues(&_Main.CallOpts, arg0)
}

// Ues is a free data retrieval call binding the contract method 0xbaf89bbe.
//
// Solidity: function ues(uint256 ) constant returns(uint256 SUPI, uint256 PK, uint256 OperatorCodeValue, uint256 Default_5QI)
func (_Main *MainCallerSession) Ues(arg0 *big.Int) (struct {
	SUPI              *big.Int
	PK                *big.Int
	OperatorCodeValue *big.Int
	Default5QI        *big.Int
}, error) {
	return _Main.Contract.Ues(&_Main.CallOpts, arg0)
}

// DeleteOneUE is a paid mutator transaction binding the contract method 0x2a034630.
//
// Solidity: function deleteOneUE(uint256 supi) returns()
func (_Main *MainTransactor) DeleteOneUE(opts *bind.TransactOpts, supi *big.Int) (*types.Transaction, error) {
	return _Main.contract.Transact(opts, "deleteOneUE", supi)
}

// DeleteOneUE is a paid mutator transaction binding the contract method 0x2a034630.
//
// Solidity: function deleteOneUE(uint256 supi) returns()
func (_Main *MainSession) DeleteOneUE(supi *big.Int) (*types.Transaction, error) {
	return _Main.Contract.DeleteOneUE(&_Main.TransactOpts, supi)
}

// DeleteOneUE is a paid mutator transaction binding the contract method 0x2a034630.
//
// Solidity: function deleteOneUE(uint256 supi) returns()
func (_Main *MainTransactorSession) DeleteOneUE(supi *big.Int) (*types.Transaction, error) {
	return _Main.Contract.DeleteOneUE(&_Main.TransactOpts, supi)
}

// NewOneUE is a paid mutator transaction binding the contract method 0x347a7079.
//
// Solidity: function newOneUE(uint256 supi, uint256 pk, uint256 ocv, uint256 qi) returns()
func (_Main *MainTransactor) NewOneUE(opts *bind.TransactOpts, supi *big.Int, pk *big.Int, ocv *big.Int, qi *big.Int) (*types.Transaction, error) {
	return _Main.contract.Transact(opts, "newOneUE", supi, pk, ocv, qi)
}

// NewOneUE is a paid mutator transaction binding the contract method 0x347a7079.
//
// Solidity: function newOneUE(uint256 supi, uint256 pk, uint256 ocv, uint256 qi) returns()
func (_Main *MainSession) NewOneUE(supi *big.Int, pk *big.Int, ocv *big.Int, qi *big.Int) (*types.Transaction, error) {
	return _Main.Contract.NewOneUE(&_Main.TransactOpts, supi, pk, ocv, qi)
}

// NewOneUE is a paid mutator transaction binding the contract method 0x347a7079.
//
// Solidity: function newOneUE(uint256 supi, uint256 pk, uint256 ocv, uint256 qi) returns()
func (_Main *MainTransactorSession) NewOneUE(supi *big.Int, pk *big.Int, ocv *big.Int, qi *big.Int) (*types.Transaction, error) {
	return _Main.Contract.NewOneUE(&_Main.TransactOpts, supi, pk, ocv, qi)
}
