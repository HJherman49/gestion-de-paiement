<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StorePaieRequest extends FormRequest
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
        return [
            'mois'              => 'required|integer|between:1,12',
            'annee'             => 'required|integer|digits:4',
            'salaire_brut'      => 'required|numeric|min:0',
            'prime'             => 'nullable|numeric|min:0',
            'scola'             => 'nullable|numeric|min:0',
            'remboursement'     => 'nullable|numeric|min:0',
            'Indice'            => 'required|integer',
            'prime_speciale'    => 'nullable|numeric|min:0',
            'prime_fin_annee'   => 'nullable|numeric|min:0',
            'alloc'             => 'nullable|numeric|min:0',
            'logement'          => 'nullable|numeric|min:0',
            'IGR'               => 'nullable|numeric|min:0',
            'rappel'            => 'nullable|numeric|min:0',
            'PA'                => 'nullable|numeric|min:0',
            'mode_paie'         => 'required|in:Virement,Cheque,Espèces',
            'date_effet'        => 'required|date',
            'Id_agent'         => 'required|exists:agents,Id_agent',
            'Id_enfant'         => 'nullable|exists:enfants,Id_enfant',
        ];
    }
}
