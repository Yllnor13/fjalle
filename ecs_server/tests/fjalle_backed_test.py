import unittest #test framework
import fjalle_backend

class fjalle_backend_test(unittest.TestCase):
    def test_dates(self):
        self.assertEqual(fjalle_backend.get_days_word("2025/4/13"), "fjalle") #the first date
        self.assertEqual(fjalle_backend.get_days_word("2025/4/12"), None) #before the first date
        
        #non correct dateformats
        self.assertEqual(fjalle_backend.get_days_word("13/4/2025"), None)
        self.assertEqual(fjalle_backend.get_days_word("4/13/2025"), None)
        self.assertEqual(fjalle_backend.get_days_word("2025/13/4"), None)

        #nonexistant dates
        self.assertEqual(fjalle_backend.get_days_word("-1/4/2025"), None)
        self.assertEqual(fjalle_backend.get_days_word("2025/4/32"), None)
        self.assertEqual(fjalle_backend.get_days_word("2025/5/32"), None)
        self.assertEqual(fjalle_backend.get_days_word("2025/6/32"), None)
        self.assertEqual(fjalle_backend.get_days_word("2025/7/32"), None)

        #leap year test
        self.assertEqual(fjalle_backend.get_days_word("2026/2/28"), "axhele")
        self.assertEqual(fjalle_backend.get_days_word("2026/2/29"), None)
    
    def test_calculation(self):
        self.assertEqual(fjalle_backend.check_letters("fjalle", "2025/4/13"), [2, 2, 2, 2, 2, 2])
        self.assertEqual(fjalle_backend.check_letters("mbathi", "2025/4/13"), [0, 0, 2, 0, 0, 0])
        self.assertEqual(fjalle_backend.check_letters("kancer", "2025/4/13"), [0, 1, 0, 0, 1, 0])
        