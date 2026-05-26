<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
class StoreCompteBancaireRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return auth()->check();
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $compteBancaire = $this->route('compte_bancaire');
        $numCompteRule = Rule::unique('compte_bancaires', 'num_compte');
        if ($compteBancaire){
            $numCompteRule = $numCompteRule -> ignore($compteBancaire->Id_compte, 'Id_compte');
        }
        return [
            'num_compte'   => ['required', 'string', $numCompteRule],
            'adresse_bnq'  => 'required|string',
            'code_localite'=> 'required|string',
            'CODQEB'       => 'nullable|string',
            'GUICHB'       => 'nullable|string',
            'RIB'          => 'nullable|string',
            'Id_agent'    => 'required|exists:agents,Id_agent',
            'Id_banque'    => 'required|exists:banques,Id_banque',
        ];
    }
}
