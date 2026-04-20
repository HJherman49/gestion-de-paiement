<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreCompteBancaireRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return false;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'num_compte'   => 'required|string|unique:compte_bancaires,num_compte',
            'adresse_bnq'  => 'required|string',
            'code_localite'=> 'required|string',
            'CODQEB'       => 'nullable|string',
            'GUICHB'       => 'nullable|string',
            'RIB'          => 'nullable|string',
            'Id_agents'    => 'required|exists:agents,Id_agents',
            'Id_banque'    => 'required|exists:banques,Id_banque',
        ];
    }
}
