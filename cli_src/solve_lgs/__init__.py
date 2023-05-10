from .create_lgs import Reaction

def tryout(r: str):
    reaction = Reaction(r)
    print(reaction)
    reaction.solve()
    print(reaction)
    
REACTION_LIST = [
    "H2 + O2 = H2O",
    "C3H6O3 + O2 = H2O + CO2"
]

for reaction in REACTION_LIST:
    tryout(reaction)
    print()
