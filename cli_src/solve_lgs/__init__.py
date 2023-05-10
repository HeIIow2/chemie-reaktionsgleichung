from .create_lgs import Reaction

reaction = Reaction("H2 + O2 = H2O")
print(reaction)
reaction.solve()
print(reaction)
