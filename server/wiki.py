import wikipedia
import sys

def fetch_summary(search_term, num_sentences):
    try:
        summary = wikipedia.summary(search_term, sentences=num_sentences)
        return summary
    except wikipedia.exceptions.DisambiguationError:
        return "Disambiguation: Multiple results found. Please refine your search."

if __name__ == "__main__":
    search_term = sys.argv[1]
    num_sentences = int(sys.argv[2])
    result = fetch_summary(search_term, num_sentences)

    # Print the result while encoding as UTF-8
    print(result.encode("utf-8").decode("utf-8"))
