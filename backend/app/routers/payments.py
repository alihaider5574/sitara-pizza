"""Payment router — COD and JazzCash/EasyPaisa integrations.

JazzCash and EasyPaisa use a form-redirect (hosted payment page) pattern
common in Pakistan. This router generates the signed POST parameters
that the frontend uses to redirect the user to the payment page.

Docs:
  JazzCash:  https://sandbox.jazzcash.com.pk/Home/Index (merchant portal)
  EasyPaisa: https://easypaystg.easypaisa.com.pk (sandbox)
"""

from __future__ import annotations
import hashlib
import hmac
import uuid
from datetime import datetime
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel

from app.config import get_settings
from app.deps import get_current_user, CurrentUser

router = APIRouter(prefix="/api/payments", tags=["payments"])


class PaymentInitRequest(BaseModel):
    order_id: str
    amount: float  # PKR
    method: str    # "jazzcash" | "easypaisa" | "cod"


class PaymentInitResponse(BaseModel):
    method: str
    redirect_url: str | None = None
    form_fields: dict | None = None   # POST params for hosted page
    message: str


# ─── COD ──────────────────────────────────────────────────────────────────────

def handle_cod(order_id: str, amount: float) -> PaymentInitResponse:
    """COD requires no gateway call — order is marked unpaid until delivery."""
    return PaymentInitResponse(
        method="cod",
        message=f"Cash on delivery selected. Pay PKR {amount:.0f} upon delivery.",
    )


# ─── JazzCash ─────────────────────────────────────────────────────────────────

def generate_jazzcash_params(order_id: str, amount: float) -> dict:
    """Generate the signed POST parameters for JazzCash hosted checkout page.

    Reference: JazzCash Merchant Integration Guide v3.x
    """
    settings = get_settings()
    txn_ref = f"T{order_id.replace('-', '')[:18]}"
    txn_date = datetime.now().strftime("%Y%m%d%H%M%S")
    amount_paisa = str(int(amount * 100))  # JazzCash uses paisa

    params = {
        "pp_Version": "1.1",
        "pp_TxnType": "MWALLET",
        "pp_Language": "EN",
        "pp_MerchantID": settings.jazzcash_merchant_id,
        "pp_SubMerchantID": "",
        "pp_Password": settings.jazzcash_password,
        "pp_TxnRefNo": txn_ref,
        "pp_Amount": amount_paisa,
        "pp_TxnCurrency": "PKR",
        "pp_TxnDateTime": txn_date,
        "pp_BillReference": f"ORDER-{order_id[:8]}",
        "pp_Description": f"Sitara Pizza Order {order_id[:8]}",
        "pp_TxnExpiryDateTime": txn_date,  # extend as needed
        "pp_ReturnURL": "https://sitarapizza.com/payment/callback/jazzcash",
        "pp_SecureHash": "",
        "ppmpf_1": "",
        "ppmpf_2": "",
        "ppmpf_3": "",
        "ppmpf_4": "",
        "ppmpf_5": "",
    }

    # Build secure hash: HMAC-SHA256 of sorted values with integrity salt
    sorted_values = "&".join(
        f"{v}" for k, v in sorted(params.items()) if k != "pp_SecureHash" and v
    )
    hash_string = f"{settings.jazzcash_integrity_salt}&{sorted_values}"
    secure_hash = hmac.new(
        settings.jazzcash_integrity_salt.encode(),
        hash_string.encode(),
        hashlib.sha256,
    ).hexdigest().upper()

    params["pp_SecureHash"] = secure_hash
    return params


# ─── EasyPaisa ────────────────────────────────────────────────────────────────

def generate_easypaisa_params(order_id: str, amount: float) -> dict:
    """Generate the signed POST parameters for EasyPaisa hosted page.

    Reference: EasyPaisa MerchantPay Integration Guide
    """
    settings = get_settings()
    order_ref = f"EP{order_id.replace('-', '')[:14]}"
    timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
    amount_str = f"{amount:.2f}"

    params = {
        "storeId": settings.easypaisa_store_id,
        "amount": amount_str,
        "postBackURL": "https://sitarapizza.com/payment/callback/easypaisa",
        "orderRefNum": order_ref,
        "autoRedirect": "1",
        "expiryDate": "",
        "merchantHashedReq": "",
    }

    # Hash: SHA-256 of concatenated values with hash key
    raw = (
        f"amount={amount_str}&"
        f"expiryDate=&"
        f"merchantHashedReq=&"
        f"orderRefNum={order_ref}&"
        f"postBackURL={params['postBackURL']}&"
        f"storeId={settings.easypaisa_store_id}"
    )
    h = hmac.new(
        settings.easypaisa_hash_key.encode(),
        raw.encode(),
        hashlib.sha256,
    ).hexdigest().upper()
    params["merchantHashedReq"] = h
    return params


# ─── Router ───────────────────────────────────────────────────────────────────

@router.post("/initiate", response_model=PaymentInitResponse)
async def initiate_payment(
    request: PaymentInitRequest,
    current_user: CurrentUser = Depends(get_current_user),
):
    """Initiate payment for an order.

    Returns either a redirect URL + form fields (for JazzCash/EasyPaisa)
    or a simple confirmation (for COD).
    """
    settings = get_settings()

    if request.method == "cod":
        return handle_cod(request.order_id, request.amount)

    elif request.method == "jazzcash":
        if not settings.jazzcash_merchant_id:
            raise HTTPException(status_code=503, detail="JazzCash not configured")
        form_fields = generate_jazzcash_params(request.order_id, request.amount)
        return PaymentInitResponse(
            method="jazzcash",
            redirect_url=settings.jazzcash_endpoint,
            form_fields=form_fields,
            message="Redirecting to JazzCash...",
        )

    elif request.method == "easypaisa":
        if not settings.easypaisa_store_id:
            raise HTTPException(status_code=503, detail="EasyPaisa not configured")
        form_fields = generate_easypaisa_params(request.order_id, request.amount)
        return PaymentInitResponse(
            method="easypaisa",
            redirect_url=settings.easypaisa_endpoint,
            form_fields=form_fields,
            message="Redirecting to EasyPaisa...",
        )

    else:
        raise HTTPException(status_code=400, detail="Unsupported payment method")
