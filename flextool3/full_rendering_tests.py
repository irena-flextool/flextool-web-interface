from django.contrib.staticfiles.testing import StaticLiveServerTestCase
from selenium.webdriver.firefox.webdriver import WebDriver
from selenium.webdriver.common.by import By


class IndexPageTests(StaticLiveServerTestCase):
    _selenium = WebDriver()

    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        cls._selenium.implicitly_wait(10)

    @classmethod
    def tearDownClass(cls):
        cls._selenium.quit()
        super().tearDownClass()

    def test_login(self):
        # This test is half-finished.
        self._selenium.get(str(self.live_server_url) + "/flextool3/accounts/login/")
        username_input = self._selenium.find_element(By.NAME, "username")
        username_input.send_keys("myuser")
        password_input = self._selenium.find_element(By.NAME, "password")
        password_input.send_keys("secret")
        self._selenium.find_element(By.XPATH, "//input[@value='login']").click()
