package WebUI

import (
	"fmt"

	"github.com/free5gc/openapi/models"
	"github.com/free5gc/util/milenage"
)

func WebAuthSubToModels(
	webAuth WebAuthenticationSubscription,
) (*models.Udr_DR_AuthenticationSubscription, error) {
	if webAuth.Opc == nil && webAuth.Milenage == nil {
		return nil, fmt.Errorf("WebAuthenticationSubscription OPc & Milenage are nil")
	}
	var encOpc string
	if webAuth.Opc != nil && webAuth.Opc.OpcValue != "" {
		encOpc = webAuth.Opc.OpcValue
	} else if webAuth.Milenage != nil && webAuth.Milenage.Op.OpValue != "" {
		opc, err := milenage.GenerateOPcFromHex(webAuth.PermanentKey.PermanentKeyValue, webAuth.Milenage.Op.OpValue)
		if err != nil {
			return nil, err
		}
		encOpc = opc
	} else {
		return nil, fmt.Errorf("WebAuthenticationSubscription OPc OP not found")
	}

	authSub := &models.Udr_DR_AuthenticationSubscription{
		AuthenticationMethod: webAuth.AuthenticationMethod,
		EncOpcKey:            encOpc,
		EncPermanentKey:      webAuth.PermanentKey.PermanentKeyValue,
		SequenceNumber: &models.Udr_DR_SequenceNumber{
			SqnScheme: models.Udr_DR_SqnScheme_GENERAL,
			Sqn:       webAuth.SequenceNumber,
		},
		AuthenticationManagementField: webAuth.AuthenticationManagementField,
	}
	return authSub, nil
}
