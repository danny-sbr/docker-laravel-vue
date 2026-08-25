<?php

namespace Database\Seeders;

use App\Models\ExampleItem;
use Illuminate\Database\Seeder;

class ExampleItemSeeder extends Seeder
{
    public function run()
    {
        $items = [
            ['name' => '專案 Alpha', 'description' => '第一個測試專案', 'status' => 'active'],
            ['name' => '專案 Beta', 'description' => '第二個測試專案', 'status' => 'active'],
            ['name' => '專案 Gamma', 'description' => '第三個測試專案', 'status' => 'inactive'],
            ['name' => '專案 Delta', 'description' => '第四個測試專案', 'status' => 'active'],
            ['name' => '專案 Epsilon', 'description' => null, 'status' => 'archived'],
            ['name' => '專案 Zeta', 'description' => '第六個測試專案', 'status' => 'active'],
            ['name' => '專案 Eta', 'description' => '第七個測試專案', 'status' => 'inactive'],
            ['name' => '專案 Theta', 'description' => '第八個測試專案', 'status' => 'active'],
            ['name' => '專案 Iota', 'description' => null, 'status' => 'archived'],
            ['name' => '專案 Kappa', 'description' => '第十個測試專案', 'status' => 'active'],
        ];

        foreach ($items as $item) {
            ExampleItem::create($item);
        }
    }
}
