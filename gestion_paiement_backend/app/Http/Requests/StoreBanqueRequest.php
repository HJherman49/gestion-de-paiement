<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreBanqueRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $banque = $this->route('banque');

        $nomBanqueRule = Rule::unique('banques', 'Nom_banque');
        $codeBanqueRule = Rule::unique('banques', 'code_banque');

        if ($banque) {
            $nomBanqueRule = $nomBanqueRule->ignore($banque->Id_banque, 'Id_banque');
            $codeBanqueRule = $codeBanqueRule->ignore($banque->Id_banque, 'Id_banque');
        }

        return [
            'Nom_banque'        => ['required', 'string', 'max:150', $nomBanqueRule],
            'agence'            => 'required|string|max:100',
            'code_banque'       => ['required', 'string', 'max:10', $codeBanqueRule],
            'code_localite_bnq' => 'required|string|max:10',
        ];
    }
}

 
