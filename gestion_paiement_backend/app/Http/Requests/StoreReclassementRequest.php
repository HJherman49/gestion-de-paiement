<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreReclassementRequest extends FormRequest
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
            'date_reclassement'      => 'required|date',
            'categ_reclassement'     => 'required|string|max:100',
            'date_effet_solde'       => 'required|date',
            'date_effet_anciennete'  => 'required|date',
            'observation'            => 'nullable|string',

            // Clé étrangère
            'Id_carriere'            => 'required|exists:carrieres,id_carriere',
        ];
    }
}
