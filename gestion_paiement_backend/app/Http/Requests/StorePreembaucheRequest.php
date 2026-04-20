<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StorePreembaucheRequest extends FormRequest
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
            
            'N_contrat'               => 'required|string|unique:preembauches,N_contrat|max:50',
            'Date_recrutement'        => 'required|date',
            'Date_recrutement1'       => 'nullable|date|after_or_equal:Date_recrutement',
            'Deb_stage_PreEmb'        => 'required|date',
            'Fin_stage_PreEmb'        => 'required|date|after_or_equal:Deb_stage_PreEmb',
            'Deb_stage_PreEmb_txt'    => 'nullable|string',
            'Fin_stage_PreEmb_txt'    => 'nullable|string',
            'Montant_PreEmb'          => 'required|numeric|min:0',
            'Montant_PreEmb_Contrat'  => 'required|numeric|min:0',

            // Clés étrangères
            'id_agent'                => 'required|exists:agents,id_agents',
            'Id_contrat'              => 'required|exists:contrats,Id_contrat',
        ];
    }
}
