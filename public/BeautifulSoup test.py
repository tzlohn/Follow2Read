import urllib.request
from bs4 import BeautifulSoup

site = r"https://learngerman.dw.com/de/06042026-kurz-und-leicht-video-nachrichten-zum-deutschlernen/a-76679751"
mysite = urllib.request.urlopen(site).read()
soup_mysite = BeautifulSoup(mysite)
test = soup_mysite.find("link",{"rel":"preload"})
print(test['href'])