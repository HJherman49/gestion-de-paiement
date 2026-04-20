<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreAgentRequest extends FormRequest
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
            'num_matricule'       => 'required|string|max:50|unique:agents,num_matricule',
            'nom'                 => 'required|string|max:100',
            'prenoms'             => 'required|string|max:150',
            'adresse'             => 'nullable|string|max:255',
            'N_CIN'               => 'required|string|size:12|unique:agents,N_CIN', // CIN malgache = 12 ihany
            'date_naissance'      => 'required|date|before:today',
            'sexe'                => 'required|in:M,F',
            'date_entree_admin'   => 'required|date',
            'date_delivrance_CI'  => 'required|date',
            'lieu_delivrance_CI'  => 'required|string|max:100',
            'civilite'            => 'required|in:Mr,Mme,Melle',
            'tel'                 => 'required|string|max:20',

            'Id_direction'        => 'required|exists:directions,Id_direction',
            'Id_service'          => 'required|exists:services,Id_service',
            'Id_division'         => 'required|exists:divisions,Id_division',
            'Id_statut'           => 'required|exists:statuts,Id_statut',
            'Id_contrat'          => 'required|exists:contrats,Id_contrat',
        ];
    }
    public function messages(): array
    {
        return [
            'num_matricule.unique' => 'Ce numéro de matricule existe déjà.',
            'N_CIN.unique'         => 'Ce numéro CIN existe déjà.',
        ];
    }
}
