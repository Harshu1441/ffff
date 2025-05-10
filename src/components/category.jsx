import React, { useState, useEffect } from 'react';
import { Plus, X } from 'lucide-react';
import axios from 'axios';
import base_Api from '../../utils/baseApi';

const Category = () => {
  const [showCreateCategoryModal, setShowCreateCategoryModal] = useState(false);
  const [predefinedRules, setPredefinedRules] = useState({});
  const [newCategory, setNewCategory] = useState({
    name: '',
    domains: ['']
  });

  // Default categories with their domains
  const defaultCategories = {
    "social_media": [
      "youtube",
      "facebook",
      "whatsapp",
      "fb messenger",
      "wechat",
      "instagram",
      "tiktok",
      "qq",
      "douyin",
      "sina weibo",
      "snapchat",
      "reddit",
      "pinterest",
      "telegram",
      "twitter",
      "quora",
      "linkedin",
      "imgur",
      "line",
      "imo",
      "brainly",
      "douban.com",
      "yy.com",
      "twitch",
      "vk",
      "babytree.com",
      "discord",
      "likee",
      "slack",
      "wattpad.com",
      "csdn.net",
      "zhanqi.tv",
      "tianya.cn",
      "ok.ru",
      "zalo.me",
      "stack overflow",
      "deviantart",
      "vsco",
      "nextdoor",
      "aparat.com",
      "medium.com",
      "pixnet.net",
      "cnblogs.com",
      "tumblr",
      "6.cn",
      "bilibili.com",
      "stackexchange.com",
      "tradingview.com",
      "slideshare.net",
      "zhihu.com",
      "behance.net",
      "nicovideo.jp",
      "steamcommunity.com",
      "kakao.com",
      "ameblo.jp",
      "9gag.com",
      "dcard.tw",
      "namasha.com",
      "livejournal",
      "ninisite.com",
      "4chan",
      "flickr.com",
      "ptt.cc",
      "kizlarsoruyor.com",
      "5ch.net",
      "hatenablog.com",
      "renren.com",
      "plurk.com",
      "eyny.com",
      "lihkg.com",
      "xing.com",
      "miaopai.com",
      "dxy.cn",
      "fetlife",
      "yammer.com",
      "weheartit.com",
      "parler",
      "letterboxd.com",
      "omegle",
      "wykop.pl",
      "workplace.com",
      "ask.fm",
      "taringa!",
      "mixi",
      "dlive",
      "mewe",
      "exblog.jp",
      "2chan.net",
      "skyrock.com",
      "mydigit.cn",
      "newgrounds",
      "nnmclub.to",
      "hacker news",
      "fark",
      "fuliba2020.net",
      "computerbase.de",
      "instiz.net",
      "gab",
      "skoob.com.br",
      "blind"
    ],
    "news": [
      "cnn.com",
      "nytimes.com",
      "bbc.com",
      "yahoo news",
      "fox news",
      "cnbc.com",
      "msn.com",
      "indiatimes.com",
      "washingtonpost.com",
      "nbc news",
      "abc news",
      "usatoday.com",
      "news.yahoo.co.jp",
      "dailymail.co.uk",
      "reuters.com",
      "news18.com",
      "news.com.au"
    ],
    "technology": [
    "github.com",
    "stackoverflow",
    "medium.com",
    "engadget.com",
    "thenextweb.com",
    "wired.com",
    "techradar.com",
    "techcrunch.com",
    "slashdot.org",
    "arstechnica.com",
    "gizmodo.com",
    "androidauthority.com",
    "howtogeek.com",
    "maketecheasier.com",
    "lifehacker.com",
    "cnet.com",
    "tomsguide.com",
    "digitaltrends.com",
    "pcmag.com",
    "xda-developers.com",
    "anandtech.com",
    "gsmarena.com",
    "producthunt.com",
    "codepen.io",
    "dev.to",
    "towardsdatascience.com",
    "hackernoon.com",
    "freecodecamp.org",
    "codecademy.com",
    "w3schools.com",
    "mozilla.org",
    "developer.mozilla.org",
    "tutorialspoint.com",
    "javatpoint.com",
    "geeksforgeeks.org",
    "programiz.com",
    "stackexchange.com",
    "sitepoint.com",
    "habr.com",
    "phoronix.com",
    "alternativeto.net",
    "dzone.com",
    "sciencedaily.com",
    "newscientist.com",
    "ieee.org",
    "scientificamerican.com",
    "springer.com",
    "nature.com",
    "acm.org",
    "plos.org",
    "arxiv.org"
  ],
    "sports": [
      "espn.com",
      "bleacherreport.com",
      "sports.yahoo.com",
      "sportsillustrated.com",
      "cbssports.com",
      "foxsports.com",
      "nbcsports.com",
      "skysports.com",
      "eurosport.com",
      "theathletic.com",
      "goal.com",
      "fifa.com",
      "uefa.com",
      "cricbuzz.com",
      "cricinfo.com",
      "tennis.com",
      "formula1.com",
      "nascar.com"
    ],
    "entertainment": [
      "imdb.com",
      "rottentomatoes.com",
      "metacritic.com",
      "boxofficemojo.com",
      "variety.com",
      "hollywoodreporter.com",
      "deadline.com",
      "ew.com",
      "pitchfork.com",
      "billboard.com",
      "rollingstone.com",
      "buzzfeed.com",
      "vulture.com",
      "theverge.com",
      "polygon.com"
    ],
    "finance": [
      "marketwatch.com",
      "investopedia.com",
      "themotleyfool.com",
      "seekingalpha.com",
      "fool.com",
      "morningstar.com",
      "yahoo finance",
      "nasdaq.com",
      "bloomberg.com",
      "cnbc.com",
      "forbes.com",
      "moneycontrol.com",
      "businessinsider.in"
    ],  
    "business": [
    "walmart.com",
    "exxonmobil.com",
    "apple.com",
    "berkshirehathaway.com",
    "amazon.com",
    "unitedhealthgroup.com",
    "mckesson.com",
    "cvshealth.com",
    "at&t.com",
    "amerisourcebergen.com",
    "chevron.com",
    "fordmotor.com",
    "generalmotors.com",
    "costcowholesale.com",
    "alphabet.com",
    "cardinalhealth.com",
    "walgreensbootsalliance.com",
    "jpmorganchase.com",
    "verizoncommunications.com",
    "kroger.com",
    "generalelectric.com",
    "fanniemae.com",
    "phillips66.com",
    "valeroenergy.com",
    "bankofamerica.com",
    "microsoft.com",
    "homedepot.com",
    "boeing.com",
    "wellsfargo.com",
    "citigroup.com",
    "marathonpetroleum.com",
    "comcast.com",
    "anthem.com",
    "delltechnologies.com",
    "dupontdenemours.com",
    "statefarminsurance.com",
    "johnson&johnson.com",
    "ibm.com",
    "target.com",
    "freddiemac.com",
    "unitedparcelservice.com",
    "lowe's.com",
    "intel.com",
    "metlife.com",
    "procter&gamble.com",
    "unitedtechnologies.com",
    "fedex.com",
    "pepsico.com",
    "archerdanielsmidland.com",
    "prudentialfinancial.com",
    "centene.com",
    "albertsons.com",
    "waltdisney.com",
    "sysco.com",
    "hp.com",
    "humana.com",
    "facebook.com",
    "caterpillar.com",
    "energytransfer.com",
    "lockheedmartin.com",
    "pfizer.com",
    "goldmansachsgroup.com",
    "morganstanley.com",
    "ciscosystems.com",
    "cigna.com",
    "aig.com",
    "hcahealthcare.com",
    "americanairlinesgroup.com",
    "deltaairlines.com",
    "chartercommunications.com",
    "newyorklifeinsurance.com",
    "americanexpress.com",
    "nationwide.com",
    "bestbuy.com",
    "libertymutualinsurancegroup.com",
    "merck.com",
    "honeywellinternational.com",
    "unitedcontinentalholdings.com",
    "tiaa.com",
    "tysonfoods.com",
    "oracle.com",
    "allstate.com",
    "worldfuelservices.com",
    "massachusettsmutuallifeinsurance.com",
    "tjx.com",
    "conocophillips.com",
    "deere.com",
    "techdata.com",
    "enterpriseproductspartners.com",
    "nike.com",
    "publixsupermarkets.com",
    "generaldynamics.com",
    "exelon.com",
    "plainsgpholdings.com",
    "3m.com",
    "abbvie.com",
    "chs.com",
    "capitalonefinancial.com",
    "progressive.com",
    "coca-cola.com"
  ],
    "health": [
      "webmd.com",
      "mayoclinic.org",
      "healthline.com",
      "verywellhealth.com",
      "medlineplus.gov",
      "health.harvard.edu",
      "clevelandclinic.org",
      "nih.gov",
      "who.int",
      "cdc.gov",
      "nccih.nih.gov",
      "fda.gov",
      "drugs.com",
      "rxlist.com",
      "medscape.com"
    ],
    "education": [
      "edx.org",
      "coursera.org",
      "khanacademy.org",
      "udacity.com",
      "skillshare.com",
      "futurelearn.com",
      "academic.oup.com",
      "jstor.org",
      "researchgate.net",
      "arxiv.org",
      "sciencedirect.com",
      "wiley.com",
      "cambridge.org",
      "springer.com",
      "sagepub.com"
    ],
    "travel": [
      "tripadvisor.com",
      "expedia.com",
      "booking.com",
      "airbnb.com",
      "kayak.com",
      "skyscanner.com",
      "travelocity.com",
      "orbitz.com",
      "hotels.com",
      "trivago.com",
      "agoda.com",
      "hostelworld.com",
      "viator.com",
      "lonelyplanet.com",
      "fodorstravel.com"
    ],
    "food": [
      "foodnetwork.com",
      "allrecipes.com",
      "epicurious.com",
      "bonappetit.com",
      "yummly.com",
      "seriouseats.com",
      "cookinglight.com",
      "bbcgoodfood.com",
      "tastespotting.com",
      "chowhound.com",
      "thekitchn.com",
      "saveur.com",
      "delish.com",
      "myrecipes.com",
      "eatingwell.com"
    ],
  }
  

  // Fetch predefined rules on component mount
  useEffect(() => {
    const fetchPredefinedRules = async () => {
      try {
        const response = await axios.get(`${base_Api}get_predefined_rules`);
        // Merge default categories with API response
        setPredefinedRules({
          ...defaultCategories,
          ...response.data.predefined_rules
        });
      } catch (error) {
        console.error('Error fetching predefined rules:', error);
        // If API fails, still set default categories
        setPredefinedRules(defaultCategories);
      }
    };

    fetchPredefinedRules();
  }, []);

  const handleAddDomainInput = () => {
    setNewCategory({
      ...newCategory,
      domains: [...newCategory.domains, '']
    });
  };

  const handleRemoveDomainInput = (index) => {
    setNewCategory({
      ...newCategory,
      domains: newCategory.domains.filter((_, i) => i !== index)
    });
  };

  const handleDomainChange = (index, value) => {
    const newDomains = [...newCategory.domains];
    newDomains[index] = value;
    setNewCategory({
      ...newCategory,
      domains: newDomains
    });
  };

  const handleCategorySelect = (e) => {
    const selectedCategory = e.target.value;
    setNewCategory({
      name: selectedCategory,
      domains: predefinedRules[selectedCategory] || ['']
    });
  };

  const handleCreateCategory = async () => {
    try {
      const payload = {
        category: newCategory.name,
        domains: newCategory.domains.filter(domain => domain.trim() !== '')
      };

      const response = await axios({
        method: 'post',
        url: `${base_Api}add_predefined_rule`,
        headers: {
          'Content-Type': 'application/json'
        },
        data: payload
      });

      if (response.status === 200) {
        // Refresh predefined rules
        const rulesResponse = await axios.get(`${base_Api}get_predefined_rules`);
        setPredefinedRules({
          ...defaultCategories,
          ...rulesResponse.data.predefined_rules
        });
        setShowCreateCategoryModal(false);
        setNewCategory({ name: '', domains: [''] });
      }
    } catch (error) {
      console.error('Error creating category:', error);
      alert('Failed to create category. Please try again.');
    }
  };

  return (
    <div>
      <button 
        onClick={() => setShowCreateCategoryModal(true)}
        className="flex items-center justify-center gap-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
      >
        <Plus size={18} />
        <span>Create Category</span>
      </button>

      {/* Create Category Modal */}
      {showCreateCategoryModal && (
        <div className="fixed inset-0 backdrop-blur-sm bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Create New Category</h3>
              <button 
                onClick={() => {
                  setShowCreateCategoryModal(false);
                  setNewCategory({ name: '', domains: [''] });
                }}
                className="text-gray-400 hover:text-gray-500"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category Name
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={newCategory.name}
                  onChange={handleCategorySelect}
                >
                  <option value="">Select or create new category</option>
                  {Object.keys(predefinedRules).map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Or enter new category name"
                  value={newCategory.name}
                  onChange={(e) => setNewCategory({...newCategory, name: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Domains
                </label>
                {newCategory.domains.map((domain, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter domain (e.g., example.com)"
                      value={domain}
                      onChange={(e) => handleDomainChange(index, e.target.value)}
                    />
                    {newCategory.domains.length > 1 && (
                      <button
                        onClick={() => handleRemoveDomainInput(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X size={20} />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={handleAddDomainInput}
                  className="mt-2 text-sm text-blue-600 hover:text-blue-800"
                >
                  + Add another domain
                </button>
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button 
                onClick={() => {
                  setShowCreateCategoryModal(false);
                  setNewCategory({ name: '', domains: [''] });
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateCategory}
                disabled={!newCategory.name || newCategory.domains.every(domain => !domain.trim())}
                className={`px-4 py-2 rounded-md ${
                  !newCategory.name || newCategory.domains.every(domain => !domain.trim())
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                Create Category
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Category;