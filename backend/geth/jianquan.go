package geth

import (
	"errors"
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
	_ = errors.New
	_ = big.NewInt
	_ = strings.NewReader
	_ = ethereum.NotFound
	_ = bind.Bind
	_ = common.Big1
	_ = types.BloomLookup
	_ = event.NewSubscription
	_ = abi.ConvertType
)

// MainMetaData contains all meta data concerning the Main contract.
var MainMetaData = &bind.MetaData{
	ABI: "[{\"constant\":true,\"inputs\":[{\"name\":\"supi\",\"type\":\"uint256\"}],\"name\":\"GetDataNetworkName\",\"outputs\":[{\"name\":\"\",\"type\":\"string\"}],\"payable\":false,\"stateMutability\":\"view\",\"type\":\"function\"},{\"constant\":true,\"inputs\":[{\"name\":\"x\",\"type\":\"uint256\"}],\"name\":\"getUEbySUPI\",\"outputs\":[{\"name\":\"\",\"type\":\"uint256\"},{\"name\":\"\",\"type\":\"uint256\"},{\"name\":\"\",\"type\":\"string\"},{\"name\":\"\",\"type\":\"string\"}],\"payable\":false,\"stateMutability\":\"view\",\"type\":\"function\"},{\"constant\":true,\"inputs\":[{\"name\":\"supi\",\"type\":\"uint256\"}],\"name\":\"GetDefaultSNSSAI\",\"outputs\":[{\"name\":\"\",\"type\":\"bool\"}],\"payable\":false,\"stateMutability\":\"view\",\"type\":\"function\"},{\"constant\":false,\"inputs\":[{\"name\":\"supi\",\"type\":\"uint256\"}],\"name\":\"deleteOneUE\",\"outputs\":[],\"payable\":false,\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"constant\":true,\"inputs\":[{\"name\":\"supi\",\"type\":\"uint256\"}],\"name\":\"GetDownlinkAMBR\",\"outputs\":[{\"name\":\"\",\"type\":\"string\"}],\"payable\":false,\"stateMutability\":\"view\",\"type\":\"function\"},{\"constant\":true,\"inputs\":[],\"name\":\"ac\",\"outputs\":[{\"name\":\"\",\"type\":\"uint256\"}],\"payable\":false,\"stateMutability\":\"view\",\"type\":\"function\"},{\"constant\":true,\"inputs\":[{\"name\":\"x\",\"type\":\"uint256\"}],\"name\":\"getOneUE\",\"outputs\":[{\"name\":\"\",\"type\":\"uint256\"},{\"name\":\"\",\"type\":\"uint256\"},{\"name\":\"\",\"type\":\"string\"},{\"name\":\"\",\"type\":\"string\"}],\"payable\":false,\"stateMutability\":\"view\",\"type\":\"function\"},{\"constant\":true,\"inputs\":[{\"name\":\"supi\",\"type\":\"uint256\"}],\"name\":\"GetPLMNID\",\"outputs\":[{\"name\":\"\",\"type\":\"string\"}],\"payable\":false,\"stateMutability\":\"view\",\"type\":\"function\"},{\"constant\":true,\"inputs\":[{\"name\":\"supi\",\"type\":\"uint256\"}],\"name\":\"GetAuMethod\",\"outputs\":[{\"name\":\"\",\"type\":\"string\"}],\"payable\":false,\"stateMutability\":\"view\",\"type\":\"function\"},{\"constant\":true,\"inputs\":[{\"name\":\"\",\"type\":\"uint256\"}],\"name\":\"defaultUes\",\"outputs\":[{\"name\":\"SST\",\"type\":\"string\"},{\"name\":\"SD\",\"type\":\"string\"},{\"name\":\"UplinkAMBR\",\"type\":\"string\"},{\"name\":\"DownlinkAMBR\",\"type\":\"string\"},{\"name\":\"DataNetworkName\",\"type\":\"string\"},{\"name\":\"PLMNID\",\"type\":\"string\"},{\"name\":\"AuMethod\",\"type\":\"string\"}],\"payable\":false,\"stateMutability\":\"view\",\"type\":\"function\"},{\"constant\":true,\"inputs\":[{\"name\":\"supi\",\"type\":\"uint256\"}],\"name\":\"GetSUPI\",\"outputs\":[{\"name\":\"\",\"type\":\"uint256\"}],\"payable\":false,\"stateMutability\":\"view\",\"type\":\"function\"},{\"constant\":true,\"inputs\":[{\"name\":\"supi\",\"type\":\"uint256\"}],\"name\":\"GetPK\",\"outputs\":[{\"name\":\"\",\"type\":\"uint256\"}],\"payable\":false,\"stateMutability\":\"view\",\"type\":\"function\"},{\"constant\":false,\"inputs\":[{\"name\":\"supi\",\"type\":\"uint256\"},{\"name\":\"pk\",\"type\":\"uint256\"},{\"name\":\"ocv\",\"type\":\"string\"},{\"name\":\"qi\",\"type\":\"string\"}],\"name\":\"newOneUE\",\"outputs\":[],\"payable\":false,\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"constant\":true,\"inputs\":[{\"name\":\"supi\",\"type\":\"uint256\"}],\"name\":\"GetDefault5QI\",\"outputs\":[{\"name\":\"\",\"type\":\"string\"}],\"payable\":false,\"stateMutability\":\"view\",\"type\":\"function\"},{\"constant\":true,\"inputs\":[],\"name\":\"getAllUE\",\"outputs\":[{\"name\":\"\",\"type\":\"uint256\"}],\"payable\":false,\"stateMutability\":\"view\",\"type\":\"function\"},{\"constant\":true,\"inputs\":[{\"name\":\"\",\"type\":\"uint256\"}],\"name\":\"ues\",\"outputs\":[{\"name\":\"SUPI\",\"type\":\"uint256\"},{\"name\":\"PK\",\"type\":\"uint256\"},{\"name\":\"OperatorCodeValue\",\"type\":\"string\"},{\"name\":\"Default_5QI\",\"type\":\"string\"},{\"name\":\"SNSSAI\",\"type\":\"bool\"}],\"payable\":false,\"stateMutability\":\"view\",\"type\":\"function\"},{\"constant\":true,\"inputs\":[{\"name\":\"\",\"type\":\"uint256\"}],\"name\":\"a\",\"outputs\":[{\"name\":\"\",\"type\":\"uint256\"}],\"payable\":false,\"stateMutability\":\"view\",\"type\":\"function\"},{\"constant\":true,\"inputs\":[{\"name\":\"supi\",\"type\":\"uint256\"}],\"name\":\"GetSD\",\"outputs\":[{\"name\":\"\",\"type\":\"string\"}],\"payable\":false,\"stateMutability\":\"view\",\"type\":\"function\"},{\"constant\":true,\"inputs\":[{\"name\":\"supi\",\"type\":\"uint256\"}],\"name\":\"GetOCV\",\"outputs\":[{\"name\":\"\",\"type\":\"string\"}],\"payable\":false,\"stateMutability\":\"view\",\"type\":\"function\"},{\"constant\":true,\"inputs\":[{\"name\":\"supi\",\"type\":\"uint256\"}],\"name\":\"GetSST\",\"outputs\":[{\"name\":\"\",\"type\":\"string\"}],\"payable\":false,\"stateMutability\":\"view\",\"type\":\"function\"},{\"constant\":true,\"inputs\":[{\"name\":\"supi\",\"type\":\"uint256\"}],\"name\":\"GetUplinkAMBR\",\"outputs\":[{\"name\":\"\",\"type\":\"string\"}],\"payable\":false,\"stateMutability\":\"view\",\"type\":\"function\"}]",
}

// MainABI is the input ABI used to generate the binding from.
// Deprecated: Use MainMetaData.ABI instead.
var MainABI = MainMetaData.ABI

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
	parsed, err := MainMetaData.GetAbi()
	if err != nil {
		return nil, err
	}
	return bind.NewBoundContract(address, *parsed, caller, transactor, filterer), nil
}

// Call invokes the (constant) contract method with params as input values and
// sets the output to result. The result type might be a single field for simple
// returns, a slice of interfaces for anonymous returns and a struct for named
// returns.
func (_Main *MainRaw) Call(opts *bind.CallOpts, result *[]interface{}, method string, params ...interface{}) error {
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
func (_Main *MainCallerRaw) Call(opts *bind.CallOpts, result *[]interface{}, method string, params ...interface{}) error {
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

// GetAuMethod is a free data retrieval call binding the contract method 0x5e2ad53a.
//
// Solidity: function GetAuMethod(uint256 supi) view returns(string)
func (_Main *MainCaller) GetAuMethod(opts *bind.CallOpts, supi *big.Int) (string, error) {
	var out []interface{}
	err := _Main.contract.Call(opts, &out, "GetAuMethod", supi)

	if err != nil {
		return *new(string), err
	}

	out0 := *abi.ConvertType(out[0], new(string)).(*string)

	return out0, err

}

// GetAuMethod is a free data retrieval call binding the contract method 0x5e2ad53a.
//
// Solidity: function GetAuMethod(uint256 supi) view returns(string)
func (_Main *MainSession) GetAuMethod(supi *big.Int) (string, error) {
	return _Main.Contract.GetAuMethod(&_Main.CallOpts, supi)
}

// GetAuMethod is a free data retrieval call binding the contract method 0x5e2ad53a.
//
// Solidity: function GetAuMethod(uint256 supi) view returns(string)
func (_Main *MainCallerSession) GetAuMethod(supi *big.Int) (string, error) {
	return _Main.Contract.GetAuMethod(&_Main.CallOpts, supi)
}

// GetDataNetworkName is a free data retrieval call binding the contract method 0x09d93e0f.
//
// Solidity: function GetDataNetworkName(uint256 supi) view returns(string)
func (_Main *MainCaller) GetDataNetworkName(opts *bind.CallOpts, supi *big.Int) (string, error) {
	var out []interface{}
	err := _Main.contract.Call(opts, &out, "GetDataNetworkName", supi)

	if err != nil {
		return *new(string), err
	}

	out0 := *abi.ConvertType(out[0], new(string)).(*string)

	return out0, err

}

// GetDataNetworkName is a free data retrieval call binding the contract method 0x09d93e0f.
//
// Solidity: function GetDataNetworkName(uint256 supi) view returns(string)
func (_Main *MainSession) GetDataNetworkName(supi *big.Int) (string, error) {
	return _Main.Contract.GetDataNetworkName(&_Main.CallOpts, supi)
}

// GetDataNetworkName is a free data retrieval call binding the contract method 0x09d93e0f.
//
// Solidity: function GetDataNetworkName(uint256 supi) view returns(string)
func (_Main *MainCallerSession) GetDataNetworkName(supi *big.Int) (string, error) {
	return _Main.Contract.GetDataNetworkName(&_Main.CallOpts, supi)
}

// GetDefault5QI is a free data retrieval call binding the contract method 0xb087fa15.
//
// Solidity: function GetDefault5QI(uint256 supi) view returns(string)
func (_Main *MainCaller) GetDefault5QI(opts *bind.CallOpts, supi *big.Int) (string, error) {
	var out []interface{}
	err := _Main.contract.Call(opts, &out, "GetDefault5QI", supi)

	if err != nil {
		return *new(string), err
	}

	out0 := *abi.ConvertType(out[0], new(string)).(*string)

	return out0, err

}

// GetDefault5QI is a free data retrieval call binding the contract method 0xb087fa15.
//
// Solidity: function GetDefault5QI(uint256 supi) view returns(string)
func (_Main *MainSession) GetDefault5QI(supi *big.Int) (string, error) {
	return _Main.Contract.GetDefault5QI(&_Main.CallOpts, supi)
}

// GetDefault5QI is a free data retrieval call binding the contract method 0xb087fa15.
//
// Solidity: function GetDefault5QI(uint256 supi) view returns(string)
func (_Main *MainCallerSession) GetDefault5QI(supi *big.Int) (string, error) {
	return _Main.Contract.GetDefault5QI(&_Main.CallOpts, supi)
}

// GetDefaultSNSSAI is a free data retrieval call binding the contract method 0x1f37fc5a.
//
// Solidity: function GetDefaultSNSSAI(uint256 supi) view returns(bool)
func (_Main *MainCaller) GetDefaultSNSSAI(opts *bind.CallOpts, supi *big.Int) (bool, error) {
	var out []interface{}
	err := _Main.contract.Call(opts, &out, "GetDefaultSNSSAI", supi)

	if err != nil {
		return *new(bool), err
	}

	out0 := *abi.ConvertType(out[0], new(bool)).(*bool)

	return out0, err

}

// GetDefaultSNSSAI is a free data retrieval call binding the contract method 0x1f37fc5a.
//
// Solidity: function GetDefaultSNSSAI(uint256 supi) view returns(bool)
func (_Main *MainSession) GetDefaultSNSSAI(supi *big.Int) (bool, error) {
	return _Main.Contract.GetDefaultSNSSAI(&_Main.CallOpts, supi)
}

// GetDefaultSNSSAI is a free data retrieval call binding the contract method 0x1f37fc5a.
//
// Solidity: function GetDefaultSNSSAI(uint256 supi) view returns(bool)
func (_Main *MainCallerSession) GetDefaultSNSSAI(supi *big.Int) (bool, error) {
	return _Main.Contract.GetDefaultSNSSAI(&_Main.CallOpts, supi)
}

// GetDownlinkAMBR is a free data retrieval call binding the contract method 0x4b40c04c.
//
// Solidity: function GetDownlinkAMBR(uint256 supi) view returns(string)
func (_Main *MainCaller) GetDownlinkAMBR(opts *bind.CallOpts, supi *big.Int) (string, error) {
	var out []interface{}
	err := _Main.contract.Call(opts, &out, "GetDownlinkAMBR", supi)

	if err != nil {
		return *new(string), err
	}

	out0 := *abi.ConvertType(out[0], new(string)).(*string)

	return out0, err

}

// GetDownlinkAMBR is a free data retrieval call binding the contract method 0x4b40c04c.
//
// Solidity: function GetDownlinkAMBR(uint256 supi) view returns(string)
func (_Main *MainSession) GetDownlinkAMBR(supi *big.Int) (string, error) {
	return _Main.Contract.GetDownlinkAMBR(&_Main.CallOpts, supi)
}

// GetDownlinkAMBR is a free data retrieval call binding the contract method 0x4b40c04c.
//
// Solidity: function GetDownlinkAMBR(uint256 supi) view returns(string)
func (_Main *MainCallerSession) GetDownlinkAMBR(supi *big.Int) (string, error) {
	return _Main.Contract.GetDownlinkAMBR(&_Main.CallOpts, supi)
}

// GetOCV is a free data retrieval call binding the contract method 0xf4c55db3.
//
// Solidity: function GetOCV(uint256 supi) view returns(string)
func (_Main *MainCaller) GetOCV(opts *bind.CallOpts, supi *big.Int) (string, error) {
	var out []interface{}
	err := _Main.contract.Call(opts, &out, "GetOCV", supi)

	if err != nil {
		return *new(string), err
	}

	out0 := *abi.ConvertType(out[0], new(string)).(*string)

	return out0, err

}

// GetOCV is a free data retrieval call binding the contract method 0xf4c55db3.
//
// Solidity: function GetOCV(uint256 supi) view returns(string)
func (_Main *MainSession) GetOCV(supi *big.Int) (string, error) {
	return _Main.Contract.GetOCV(&_Main.CallOpts, supi)
}

// GetOCV is a free data retrieval call binding the contract method 0xf4c55db3.
//
// Solidity: function GetOCV(uint256 supi) view returns(string)
func (_Main *MainCallerSession) GetOCV(supi *big.Int) (string, error) {
	return _Main.Contract.GetOCV(&_Main.CallOpts, supi)
}

// GetPK is a free data retrieval call binding the contract method 0x85bf5efd.
//
// Solidity: function GetPK(uint256 supi) view returns(uint256)
func (_Main *MainCaller) GetPK(opts *bind.CallOpts, supi *big.Int) (*big.Int, error) {
	var out []interface{}
	err := _Main.contract.Call(opts, &out, "GetPK", supi)

	if err != nil {
		return *new(*big.Int), err
	}

	out0 := *abi.ConvertType(out[0], new(*big.Int)).(**big.Int)

	return out0, err

}

// GetPK is a free data retrieval call binding the contract method 0x85bf5efd.
//
// Solidity: function GetPK(uint256 supi) view returns(uint256)
func (_Main *MainSession) GetPK(supi *big.Int) (*big.Int, error) {
	return _Main.Contract.GetPK(&_Main.CallOpts, supi)
}

// GetPK is a free data retrieval call binding the contract method 0x85bf5efd.
//
// Solidity: function GetPK(uint256 supi) view returns(uint256)
func (_Main *MainCallerSession) GetPK(supi *big.Int) (*big.Int, error) {
	return _Main.Contract.GetPK(&_Main.CallOpts, supi)
}

// GetPLMNID is a free data retrieval call binding the contract method 0x5b72e3d1.
//
// Solidity: function GetPLMNID(uint256 supi) view returns(string)
func (_Main *MainCaller) GetPLMNID(opts *bind.CallOpts, supi *big.Int) (string, error) {
	var out []interface{}
	err := _Main.contract.Call(opts, &out, "GetPLMNID", supi)

	if err != nil {
		return *new(string), err
	}

	out0 := *abi.ConvertType(out[0], new(string)).(*string)

	return out0, err

}

// GetPLMNID is a free data retrieval call binding the contract method 0x5b72e3d1.
//
// Solidity: function GetPLMNID(uint256 supi) view returns(string)
func (_Main *MainSession) GetPLMNID(supi *big.Int) (string, error) {
	return _Main.Contract.GetPLMNID(&_Main.CallOpts, supi)
}

// GetPLMNID is a free data retrieval call binding the contract method 0x5b72e3d1.
//
// Solidity: function GetPLMNID(uint256 supi) view returns(string)
func (_Main *MainCallerSession) GetPLMNID(supi *big.Int) (string, error) {
	return _Main.Contract.GetPLMNID(&_Main.CallOpts, supi)
}

// GetSD is a free data retrieval call binding the contract method 0xf17a3380.
//
// Solidity: function GetSD(uint256 supi) view returns(string)
func (_Main *MainCaller) GetSD(opts *bind.CallOpts, supi *big.Int) (string, error) {
	var out []interface{}
	err := _Main.contract.Call(opts, &out, "GetSD", supi)

	if err != nil {
		return *new(string), err
	}

	out0 := *abi.ConvertType(out[0], new(string)).(*string)

	return out0, err

}

// GetSD is a free data retrieval call binding the contract method 0xf17a3380.
//
// Solidity: function GetSD(uint256 supi) view returns(string)
func (_Main *MainSession) GetSD(supi *big.Int) (string, error) {
	return _Main.Contract.GetSD(&_Main.CallOpts, supi)
}

// GetSD is a free data retrieval call binding the contract method 0xf17a3380.
//
// Solidity: function GetSD(uint256 supi) view returns(string)
func (_Main *MainCallerSession) GetSD(supi *big.Int) (string, error) {
	return _Main.Contract.GetSD(&_Main.CallOpts, supi)
}

// GetSST is a free data retrieval call binding the contract method 0xf5f35455.
//
// Solidity: function GetSST(uint256 supi) view returns(string)
func (_Main *MainCaller) GetSST(opts *bind.CallOpts, supi *big.Int) (string, error) {
	var out []interface{}
	err := _Main.contract.Call(opts, &out, "GetSST", supi)

	if err != nil {
		return *new(string), err
	}

	out0 := *abi.ConvertType(out[0], new(string)).(*string)

	return out0, err

}

// GetSST is a free data retrieval call binding the contract method 0xf5f35455.
//
// Solidity: function GetSST(uint256 supi) view returns(string)
func (_Main *MainSession) GetSST(supi *big.Int) (string, error) {
	return _Main.Contract.GetSST(&_Main.CallOpts, supi)
}

// GetSST is a free data retrieval call binding the contract method 0xf5f35455.
//
// Solidity: function GetSST(uint256 supi) view returns(string)
func (_Main *MainCallerSession) GetSST(supi *big.Int) (string, error) {
	return _Main.Contract.GetSST(&_Main.CallOpts, supi)
}

// GetSUPI is a free data retrieval call binding the contract method 0x7df1c7ae.
//
// Solidity: function GetSUPI(uint256 supi) view returns(uint256)
func (_Main *MainCaller) GetSUPI(opts *bind.CallOpts, supi *big.Int) (*big.Int, error) {
	var out []interface{}
	err := _Main.contract.Call(opts, &out, "GetSUPI", supi)

	if err != nil {
		return *new(*big.Int), err
	}

	out0 := *abi.ConvertType(out[0], new(*big.Int)).(**big.Int)

	return out0, err

}

// GetSUPI is a free data retrieval call binding the contract method 0x7df1c7ae.
//
// Solidity: function GetSUPI(uint256 supi) view returns(uint256)
func (_Main *MainSession) GetSUPI(supi *big.Int) (*big.Int, error) {
	return _Main.Contract.GetSUPI(&_Main.CallOpts, supi)
}

// GetSUPI is a free data retrieval call binding the contract method 0x7df1c7ae.
//
// Solidity: function GetSUPI(uint256 supi) view returns(uint256)
func (_Main *MainCallerSession) GetSUPI(supi *big.Int) (*big.Int, error) {
	return _Main.Contract.GetSUPI(&_Main.CallOpts, supi)
}

// GetUplinkAMBR is a free data retrieval call binding the contract method 0xfba853d8.
//
// Solidity: function GetUplinkAMBR(uint256 supi) view returns(string)
func (_Main *MainCaller) GetUplinkAMBR(opts *bind.CallOpts, supi *big.Int) (string, error) {
	var out []interface{}
	err := _Main.contract.Call(opts, &out, "GetUplinkAMBR", supi)

	if err != nil {
		return *new(string), err
	}

	out0 := *abi.ConvertType(out[0], new(string)).(*string)

	return out0, err

}

// GetUplinkAMBR is a free data retrieval call binding the contract method 0xfba853d8.
//
// Solidity: function GetUplinkAMBR(uint256 supi) view returns(string)
func (_Main *MainSession) GetUplinkAMBR(supi *big.Int) (string, error) {
	return _Main.Contract.GetUplinkAMBR(&_Main.CallOpts, supi)
}

// GetUplinkAMBR is a free data retrieval call binding the contract method 0xfba853d8.
//
// Solidity: function GetUplinkAMBR(uint256 supi) view returns(string)
func (_Main *MainCallerSession) GetUplinkAMBR(supi *big.Int) (string, error) {
	return _Main.Contract.GetUplinkAMBR(&_Main.CallOpts, supi)
}

// A is a free data retrieval call binding the contract method 0xf0fdf834.
//
// Solidity: function a(uint256 ) view returns(uint256)
func (_Main *MainCaller) A(opts *bind.CallOpts, arg0 *big.Int) (*big.Int, error) {
	var out []interface{}
	err := _Main.contract.Call(opts, &out, "a", arg0)

	if err != nil {
		return *new(*big.Int), err
	}

	out0 := *abi.ConvertType(out[0], new(*big.Int)).(**big.Int)

	return out0, err

}

// A is a free data retrieval call binding the contract method 0xf0fdf834.
//
// Solidity: function a(uint256 ) view returns(uint256)
func (_Main *MainSession) A(arg0 *big.Int) (*big.Int, error) {
	return _Main.Contract.A(&_Main.CallOpts, arg0)
}

// A is a free data retrieval call binding the contract method 0xf0fdf834.
//
// Solidity: function a(uint256 ) view returns(uint256)
func (_Main *MainCallerSession) A(arg0 *big.Int) (*big.Int, error) {
	return _Main.Contract.A(&_Main.CallOpts, arg0)
}

// Ac is a free data retrieval call binding the contract method 0x54b7c39b.
//
// Solidity: function ac() view returns(uint256)
func (_Main *MainCaller) Ac(opts *bind.CallOpts) (*big.Int, error) {
	var out []interface{}
	err := _Main.contract.Call(opts, &out, "ac")

	if err != nil {
		return *new(*big.Int), err
	}

	out0 := *abi.ConvertType(out[0], new(*big.Int)).(**big.Int)

	return out0, err

}

// Ac is a free data retrieval call binding the contract method 0x54b7c39b.
//
// Solidity: function ac() view returns(uint256)
func (_Main *MainSession) Ac() (*big.Int, error) {
	return _Main.Contract.Ac(&_Main.CallOpts)
}

// Ac is a free data retrieval call binding the contract method 0x54b7c39b.
//
// Solidity: function ac() view returns(uint256)
func (_Main *MainCallerSession) Ac() (*big.Int, error) {
	return _Main.Contract.Ac(&_Main.CallOpts)
}

// DefaultUes is a free data retrieval call binding the contract method 0x7a7dba0f.
//
// Solidity: function defaultUes(uint256 ) view returns(string SST, string SD, string UplinkAMBR, string DownlinkAMBR, string DataNetworkName, string PLMNID, string AuMethod)
func (_Main *MainCaller) DefaultUes(opts *bind.CallOpts, arg0 *big.Int) (struct {
	SST             string
	SD              string
	UplinkAMBR      string
	DownlinkAMBR    string
	DataNetworkName string
	PLMNID          string
	AuMethod        string
}, error) {
	var out []interface{}
	err := _Main.contract.Call(opts, &out, "defaultUes", arg0)

	outstruct := new(struct {
		SST             string
		SD              string
		UplinkAMBR      string
		DownlinkAMBR    string
		DataNetworkName string
		PLMNID          string
		AuMethod        string
	})
	if err != nil {
		return *outstruct, err
	}

	outstruct.SST = *abi.ConvertType(out[0], new(string)).(*string)
	outstruct.SD = *abi.ConvertType(out[1], new(string)).(*string)
	outstruct.UplinkAMBR = *abi.ConvertType(out[2], new(string)).(*string)
	outstruct.DownlinkAMBR = *abi.ConvertType(out[3], new(string)).(*string)
	outstruct.DataNetworkName = *abi.ConvertType(out[4], new(string)).(*string)
	outstruct.PLMNID = *abi.ConvertType(out[5], new(string)).(*string)
	outstruct.AuMethod = *abi.ConvertType(out[6], new(string)).(*string)

	return *outstruct, err

}

// DefaultUes is a free data retrieval call binding the contract method 0x7a7dba0f.
//
// Solidity: function defaultUes(uint256 ) view returns(string SST, string SD, string UplinkAMBR, string DownlinkAMBR, string DataNetworkName, string PLMNID, string AuMethod)
func (_Main *MainSession) DefaultUes(arg0 *big.Int) (struct {
	SST             string
	SD              string
	UplinkAMBR      string
	DownlinkAMBR    string
	DataNetworkName string
	PLMNID          string
	AuMethod        string
}, error) {
	return _Main.Contract.DefaultUes(&_Main.CallOpts, arg0)
}

// DefaultUes is a free data retrieval call binding the contract method 0x7a7dba0f.
//
// Solidity: function defaultUes(uint256 ) view returns(string SST, string SD, string UplinkAMBR, string DownlinkAMBR, string DataNetworkName, string PLMNID, string AuMethod)
func (_Main *MainCallerSession) DefaultUes(arg0 *big.Int) (struct {
	SST             string
	SD              string
	UplinkAMBR      string
	DownlinkAMBR    string
	DataNetworkName string
	PLMNID          string
	AuMethod        string
}, error) {
	return _Main.Contract.DefaultUes(&_Main.CallOpts, arg0)
}

// GetAllUE is a free data retrieval call binding the contract method 0xb6bbd4f9.
//
// Solidity: function getAllUE() view returns(uint256)
func (_Main *MainCaller) GetAllUE(opts *bind.CallOpts) (*big.Int, error) {
	var out []interface{}
	err := _Main.contract.Call(opts, &out, "getAllUE")

	if err != nil {
		return *new(*big.Int), err
	}

	out0 := *abi.ConvertType(out[0], new(*big.Int)).(**big.Int)

	return out0, err

}

// GetAllUE is a free data retrieval call binding the contract method 0xb6bbd4f9.
//
// Solidity: function getAllUE() view returns(uint256)
func (_Main *MainSession) GetAllUE() (*big.Int, error) {
	return _Main.Contract.GetAllUE(&_Main.CallOpts)
}

// GetAllUE is a free data retrieval call binding the contract method 0xb6bbd4f9.
//
// Solidity: function getAllUE() view returns(uint256)
func (_Main *MainCallerSession) GetAllUE() (*big.Int, error) {
	return _Main.Contract.GetAllUE(&_Main.CallOpts)
}

// GetOneUE is a free data retrieval call binding the contract method 0x56f06414.
//
// Solidity: function getOneUE(uint256 x) view returns(uint256, uint256, string, string)
func (_Main *MainCaller) GetOneUE(opts *bind.CallOpts, x *big.Int) (*big.Int, *big.Int, string, string, error) {
	var out []interface{}
	err := _Main.contract.Call(opts, &out, "getOneUE", x)

	if err != nil {
		return *new(*big.Int), *new(*big.Int), *new(string), *new(string), err
	}

	out0 := *abi.ConvertType(out[0], new(*big.Int)).(**big.Int)
	out1 := *abi.ConvertType(out[1], new(*big.Int)).(**big.Int)
	out2 := *abi.ConvertType(out[2], new(string)).(*string)
	out3 := *abi.ConvertType(out[3], new(string)).(*string)

	return out0, out1, out2, out3, err

}

// GetOneUE is a free data retrieval call binding the contract method 0x56f06414.
//
// Solidity: function getOneUE(uint256 x) view returns(uint256, uint256, string, string)
func (_Main *MainSession) GetOneUE(x *big.Int) (*big.Int, *big.Int, string, string, error) {
	return _Main.Contract.GetOneUE(&_Main.CallOpts, x)
}

// GetOneUE is a free data retrieval call binding the contract method 0x56f06414.
//
// Solidity: function getOneUE(uint256 x) view returns(uint256, uint256, string, string)
func (_Main *MainCallerSession) GetOneUE(x *big.Int) (*big.Int, *big.Int, string, string, error) {
	return _Main.Contract.GetOneUE(&_Main.CallOpts, x)
}

// GetUEbySUPI is a free data retrieval call binding the contract method 0x1ae24962.
//
// Solidity: function getUEbySUPI(uint256 x) view returns(uint256, uint256, string, string)
func (_Main *MainCaller) GetUEbySUPI(opts *bind.CallOpts, x *big.Int) (*big.Int, *big.Int, string, string, error) {
	var out []interface{}
	err := _Main.contract.Call(opts, &out, "getUEbySUPI", x)

	if err != nil {
		return *new(*big.Int), *new(*big.Int), *new(string), *new(string), err
	}

	out0 := *abi.ConvertType(out[0], new(*big.Int)).(**big.Int)
	out1 := *abi.ConvertType(out[1], new(*big.Int)).(**big.Int)
	out2 := *abi.ConvertType(out[2], new(string)).(*string)
	out3 := *abi.ConvertType(out[3], new(string)).(*string)

	return out0, out1, out2, out3, err

}

// GetUEbySUPI is a free data retrieval call binding the contract method 0x1ae24962.
//
// Solidity: function getUEbySUPI(uint256 x) view returns(uint256, uint256, string, string)
func (_Main *MainSession) GetUEbySUPI(x *big.Int) (*big.Int, *big.Int, string, string, error) {
	return _Main.Contract.GetUEbySUPI(&_Main.CallOpts, x)
}

// GetUEbySUPI is a free data retrieval call binding the contract method 0x1ae24962.
//
// Solidity: function getUEbySUPI(uint256 x) view returns(uint256, uint256, string, string)
func (_Main *MainCallerSession) GetUEbySUPI(x *big.Int) (*big.Int, *big.Int, string, string, error) {
	return _Main.Contract.GetUEbySUPI(&_Main.CallOpts, x)
}

// Ues is a free data retrieval call binding the contract method 0xbaf89bbe.
//
// Solidity: function ues(uint256 ) view returns(uint256 SUPI, uint256 PK, string OperatorCodeValue, string Default_5QI, bool SNSSAI)
func (_Main *MainCaller) Ues(opts *bind.CallOpts, arg0 *big.Int) (struct {
	SUPI              *big.Int
	PK                *big.Int
	OperatorCodeValue string
	Default5QI        string
	SNSSAI            bool
}, error) {
	var out []interface{}
	err := _Main.contract.Call(opts, &out, "ues", arg0)

	outstruct := new(struct {
		SUPI              *big.Int
		PK                *big.Int
		OperatorCodeValue string
		Default5QI        string
		SNSSAI            bool
	})
	if err != nil {
		return *outstruct, err
	}

	outstruct.SUPI = *abi.ConvertType(out[0], new(*big.Int)).(**big.Int)
	outstruct.PK = *abi.ConvertType(out[1], new(*big.Int)).(**big.Int)
	outstruct.OperatorCodeValue = *abi.ConvertType(out[2], new(string)).(*string)
	outstruct.Default5QI = *abi.ConvertType(out[3], new(string)).(*string)
	outstruct.SNSSAI = *abi.ConvertType(out[4], new(bool)).(*bool)

	return *outstruct, err

}

// Ues is a free data retrieval call binding the contract method 0xbaf89bbe.
//
// Solidity: function ues(uint256 ) view returns(uint256 SUPI, uint256 PK, string OperatorCodeValue, string Default_5QI, bool SNSSAI)
func (_Main *MainSession) Ues(arg0 *big.Int) (struct {
	SUPI              *big.Int
	PK                *big.Int
	OperatorCodeValue string
	Default5QI        string
	SNSSAI            bool
}, error) {
	return _Main.Contract.Ues(&_Main.CallOpts, arg0)
}

// Ues is a free data retrieval call binding the contract method 0xbaf89bbe.
//
// Solidity: function ues(uint256 ) view returns(uint256 SUPI, uint256 PK, string OperatorCodeValue, string Default_5QI, bool SNSSAI)
func (_Main *MainCallerSession) Ues(arg0 *big.Int) (struct {
	SUPI              *big.Int
	PK                *big.Int
	OperatorCodeValue string
	Default5QI        string
	SNSSAI            bool
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

// NewOneUE is a paid mutator transaction binding the contract method 0xaa557d22.
//
// Solidity: function newOneUE(uint256 supi, uint256 pk, string ocv, string qi) returns()
func (_Main *MainTransactor) NewOneUE(opts *bind.TransactOpts, supi *big.Int, pk *big.Int, ocv string, qi string) (*types.Transaction, error) {
	return _Main.contract.Transact(opts, "newOneUE", supi, pk, ocv, qi)
}

// NewOneUE is a paid mutator transaction binding the contract method 0xaa557d22.
//
// Solidity: function newOneUE(uint256 supi, uint256 pk, string ocv, string qi) returns()
func (_Main *MainSession) NewOneUE(supi *big.Int, pk *big.Int, ocv string, qi string) (*types.Transaction, error) {
	return _Main.Contract.NewOneUE(&_Main.TransactOpts, supi, pk, ocv, qi)
}

// NewOneUE is a paid mutator transaction binding the contract method 0xaa557d22.
//
// Solidity: function newOneUE(uint256 supi, uint256 pk, string ocv, string qi) returns()
func (_Main *MainTransactorSession) NewOneUE(supi *big.Int, pk *big.Int, ocv string, qi string) (*types.Transaction, error) {
	return _Main.Contract.NewOneUE(&_Main.TransactOpts, supi, pk, ocv, qi)
}
