import unittest
import import_roblox_map as importer


class ImportTests(unittest.TestCase):
    def test_xml_control_characters_are_removed_without_running_scripts(self):
        scene = importer.read_scene('<roblox><Item class="Script"><Properties><ProtectedString name="Source">bad\x10code()</ProtectedString></Properties></Item></roblox>')
        self.assertEqual(scene['parts'], [])
        self.assertEqual(scene['report']['scriptsExcluded'], 1)
        self.assertEqual(scene['report']['controlCharactersRemoved'], 1)

    def test_part_transform_and_color_survive_conversion(self):
        scene = importer.read_scene('''<roblox><Item class="Part"><Properties>
          <string name="Name">Floor</string><CoordinateFrame name="CFrame">
          <X>10</X><Y>20</Y><Z>30</Z><R00>0</R00><R01>0</R01><R02>1</R02>
          <R10>0</R10><R11>1</R11><R12>0</R12><R20>-1</R20><R21>0</R21><R22>0</R22></CoordinateFrame>
          <Vector3 name="size"><X>4</X><Y>2</Y><Z>6</Z></Vector3>
          <Color3uint8 name="Color3uint8">4294901760</Color3uint8><bool name="CanCollide">true</bool>
        </Properties></Item></roblox>''', origin=(0, 0, 0), scale=0.5)
        part = scene['parts'][0]
        self.assertEqual(part['position'], [5, 10, 15])
        self.assertEqual(part['size'], [2, 1, 3])
        self.assertEqual(part['rotation'], [0, 0, 1, 0, 1, 0, -1, 0, 0])
        self.assertEqual(part['color'], '#ff0000')
        self.assertTrue(part['collide'])

    def test_asset_ids_only_accept_known_roblox_asset_forms(self):
        self.assertEqual(importer.asset_id('rbxassetid://12345'), '12345')
        self.assertEqual(importer.asset_id('http://www.roblox.com/asset/?id=42'), '42')
        self.assertIsNone(importer.asset_id('https://example.com/12345'))


if __name__ == '__main__':
    unittest.main()
