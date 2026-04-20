<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreDirectionRequest extends FormRequest
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
            'nom_direction' => 'required|string|max:150|unique:directions,nom_direction',
            'sigle'         => 'required|string|max:20|unique:directions,sigle',
            'siege'         => 'required|string|max:100',
            'faritany'      => 'required|string|max:100',
        ];
    }
}
