<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreCarriereRequest extends FormRequest
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
            'Categorie'   => 'required|string|max:100',
            'corps'       => 'required|string|max:100',
            'grade'       => 'required|string|max:100',
            'classe'      => 'required|string|max:50',
            'echelon'     => 'required|string|max:50',
            'indice'      => 'required|integer|min:1',
            'Id_agent'   => 'required|exists:agents,Id_agent',
            'Id_bareme'   => 'required|exists:baremes,Id_bareme',
        ];
    }
}
