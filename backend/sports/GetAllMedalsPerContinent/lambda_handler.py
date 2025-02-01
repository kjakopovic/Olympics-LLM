import logging
import pandas as pd

logger = logging.getLogger("GetAllMedalsPerContinent")
logger.setLevel(logging.DEBUG)

from common.common import (
    lambda_middleware,
    build_response,
)

continent_map = {
    'asia': ['China', 'Iran', 'Pakistan', 'India', 'Malaysia', 'Japan', 'Thailand', 'Indonesia', 'Philippines', 
             'Singapore', 'Uzbekistan', 'Kyrgyzstan', 'Tajikistan', 'Kazakhstan', 'Brunei', 'Turkmenistan', 
             'Saudi Arabia', 'Syria', 'Maldives', 'United Arab Emirates', 'North Yemen', 'Lebanon', 'Qatar', 
             'Jordan', 'Palestine', 'Bahrain', 'Kuwait', 'Iraq', 'Afghanistan', 'Mongolia', 'Bangladesh', 
             'Sri Lanka', 'Nepal', 'Vietnam', 'Myanmar', 'Yemen', 'Oman', 'Cambodia', 'Bhutan', 'Chinese Taipei'],
    
    'europe': ['Denmark', 'Sweden', 'Netherlands', 'Finland', 'Norway', 'Romania', 'Estonia', 'France', 'Spain', 
               'Bulgaria', 'Italy', 'Russia', 'Belarus', 'Greece', 'Turkey', 'Germany', 'Ireland', 'Belgium', 
               'Portugal', 'Slovenia', 'Luxembourg', 'Czech Republic', 'Poland', 'Hungary', 'Ukraine', 'Iceland', 
               'Switzerland', 'Austria', 'Lithuania', 'Cyprus', 'Slovakia', 'Latvia', 'Moldova', 'Serbia', 
               'Montenegro', 'Bosnia and Herzegovina', 'Croatia', 'Macedonia', 'Albania', 'Andorra', 'San Marino', 
               'Liechtenstein', 'Monaco', 'Great Britain', 'Soviet Union', 'Unified Team'],

    'africa': ['Morocco', 'Egypt', 'Chad', 'Sudan', 'Algeria', 'Ethiopia', 'Eritrea', 'Tanzania', 'Tunisia', 'Libya', 
               'Djibouti', 'Comoros', 'Mauritius', 'Seychelles', 'Nigeria', 'Cameroon', "Cote d'Ivoire", 'Kenya', 
               'Benin', 'Ghana', 'Somalia', 'Niger', 'Mali', 'Uganda', 'Angola', 'South Africa', 'Senegal', 'Togo', 
               'Namibia', 'Guinea', 'Guinea Bissau', 'Burkina Faso', 'Mozambique', 'Madagascar', 'Rwanda', 
               'Equatorial Guinea', 'Central African Republic', 'Botswana', 'Liberia', 'Sierra Leone', 'Gambia', 
               'Zimbabwe', 'Zambia', 'Malawi', 'Burundi', 'Sao Tome and Principe', 'Swaziland'],

    'north_america': ['United States', 'Canada', 'Mexico', 'Cuba', 'Nicaragua', 'Costa Rica', 'Panama', 'Jamaica', 
                      'Haiti', 'Dominican Republic', 'Puerto Rico', 'Honduras', 'El Salvador', 'Guatemala', 
                      'Bahamas', 'Trinidad and Tobago', 'Belize', 'Saint Kitts and Nevis', 'Saint Vincent and the Grenadines', 
                      'Dominica', 'Barbados', 'Bermuda', 'Saint Lucia', 'Cayman Islands', 'Antigua and Barbuda', 
                      'United States Virgin Islands', 'British Virgin Islands', 'West Indies Federation', 'Greenland'],

    'south_america': ['Argentina', 'Chile', 'Brazil', 'Venezuela', 'Colombia', 'Paraguay', 'Peru', 'Guyana', 'Uruguay', 
                      'Ecuador', 'Suriname', 'Bolivia'],

    'australia': ['Australia', 'New Zealand', 'Fiji', 'Papua New Guinea', 'Vanuatu', 'Solomon Islands', 'Samoa', 
                'American Samoa', 'Palau', 'Marshall Islands', 'Micronesia', 'Kiribati', 'Nauru', 'Tuvalu']
}

@lambda_middleware
def lambda_handler(event, context):
    data = get_medals_per_continent_data()
    
    return build_response(
        200,
        {
            'message': "Retrieved medal count per continents",
            'data': data
        }
    )

def get_medals_per_continent_data():
    dataset = pd.read_csv("common/dataset.csv")

    dataset['continent'] = dataset['Team'].apply(get_continent)

    medal_counts = dataset.pivot_table(index='Continent', columns='Medal', aggfunc='size', fill_value=0)

    medal_counts['total'] = medal_counts.sum(axis=1)

    medal_counts = medal_counts[['total']]
    medal_counts = medal_counts.reset_index()

    return medal_counts.to_dict(orient='records')

def get_continent(country):
    # Handling combined country names like "Denmark/Sweden"
    if '/' in country:
        parts = country.split('/')
        for part in parts:
            for continent, countries in continent_map.items():
                if part.strip() in countries:
                    return continent
    else:
        for continent, countries in continent_map.items():
            if country in countries:
                return continent
    return 'Unknown'